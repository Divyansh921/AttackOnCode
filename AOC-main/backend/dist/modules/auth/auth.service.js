"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const argon2 = require("argon2");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const token_service_1 = require("./services/token.service");
const session_service_1 = require("./services/session.service");
const audit_service_1 = require("./services/audit.service");
const email_service_1 = require("./services/email.service");
let AuthService = class AuthService {
    constructor(prisma, tokenService, sessionService, auditService, emailService) {
        this.prisma = prisma;
        this.tokenService = tokenService;
        this.sessionService = sessionService;
        this.auditService = auditService;
        this.emailService = emailService;
    }
    async register(dto, ipAddress, userAgent) {
        const existing = await this.prisma.user.findFirst({
            where: { OR: [{ username: dto.username }, { email: dto.email }] },
        });
        if (existing) {
            const field = existing.username === dto.username ? 'Username' : 'Email';
            throw new common_1.ConflictException(`${field} already taken`);
        }
        const passwordHash = await argon2.hash(dto.password, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
        });
        const emailVerifyToken = this.tokenService.generateEmailVerifyToken();
        const user = await this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    username: dto.username,
                    fullName: dto.fullName,
                    email: dto.email,
                    passwordHash,
                    college: dto.college,
                    year: dto.year,
                    emailVerifyToken,
                    role: 'user',
                    availabilityStatus: 'inactive',
                },
            });
            await tx.userStats.create({ data: { userId: newUser.id } });
            await tx.userPreferences.create({ data: { userId: newUser.id } });
            return newUser;
        });
        const { refreshToken } = await this.sessionService.createSession(user.id, ipAddress, userAgent);
        await this.auditService.log('register', user.id, ipAddress, userAgent, {
            email: user.email,
        });
        await this.emailService.sendVerificationEmail(user.email, emailVerifyToken);
        return this.buildAuthResult(user, refreshToken);
    }
    async login(dto, ipAddress, userAgent) {
        const recentFailures = await this.auditService.getRecentFailedLogins(ipAddress || '', 15);
        if (recentFailures >= 10) {
            throw new common_1.ForbiddenException('Too many failed login attempts. Please try again in 15 minutes.');
        }
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: dto.emailOrUsername }, { username: dto.emailOrUsername }],
            },
        });
        if (!user || !user.passwordHash) {
            await this.auditService.log('login_failed', null, ipAddress, userAgent, {
                identifier: dto.emailOrUsername,
                reason: 'user_not_found',
            });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const valid = await argon2.verify(user.passwordHash, dto.password);
        if (!valid) {
            await this.auditService.log('login_failed', user.id, ipAddress, userAgent, {
                reason: 'wrong_password',
            });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const { refreshToken } = await this.sessionService.createSession(user.id, ipAddress, userAgent);
        await this.auditService.log('login_success', user.id, ipAddress, userAgent);
        return this.buildAuthResult(user, refreshToken);
    }
    async refreshToken(refreshToken, ipAddress) {
        const result = await this.sessionService.validateAndRotate(refreshToken, ipAddress);
        if (!result) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: result.userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const accessToken = this.tokenService.generateAccessToken({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        });
        await this.auditService.log('token_refreshed', user.id, ipAddress);
        return { accessToken, refreshToken: result.newRefreshToken };
    }
    async logout(refreshToken, userId, ipAddress, userAgent) {
        const tokenHash = this.tokenService.hashToken(refreshToken);
        const session = await this.prisma.session.findFirst({
            where: { refreshTokenHash: tokenHash, userId },
        });
        if (session) {
            await this.sessionService.revokeSession(session.id, userId);
        }
        await this.auditService.log('logout', userId, ipAddress, userAgent);
    }
    async logoutAllDevices(userId, ipAddress) {
        await this.sessionService.revokeAllSessions(userId);
        await this.auditService.log('session_revoked', userId, ipAddress, undefined, {
            scope: 'all_devices',
        });
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findFirst({
            where: { emailVerifyToken: token, emailVerified: false },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired verification link');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerifyToken: null,
            },
        });
        await this.auditService.log('email_verified', user.id);
        return { message: 'Email verified successfully' };
    }
    async requestPasswordReset(email, ipAddress) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return { message: 'If an account exists, a reset link has been sent.' };
        }
        const resetToken = this.tokenService.generatePasswordResetToken();
        const tokenHash = this.tokenService.hashToken(resetToken);
        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            },
        });
        await this.auditService.log('password_reset_request', user.id, ipAddress);
        await this.emailService.sendPasswordResetEmail(user.email, resetToken);
        return { message: 'If an account exists, a reset link has been sent.' };
    }
    async resetPassword(token, newPassword, ipAddress) {
        const tokenHash = this.tokenService.hashToken(token);
        const resetRecord = await this.prisma.passwordResetToken.findFirst({
            where: {
                tokenHash,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
        });
        if (!resetRecord) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const passwordHash = await argon2.hash(newPassword, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
        });
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: resetRecord.userId },
                data: { passwordHash },
            });
            await tx.passwordResetToken.update({
                where: { id: resetRecord.id },
                data: { usedAt: new Date() },
            });
            await tx.session.updateMany({
                where: { userId: resetRecord.userId },
                data: { revoked: true },
            });
        });
        await this.auditService.log('password_reset_complete', resetRecord.userId, ipAddress);
        return { message: 'Password reset successfully. Please log in again.' };
    }
    async handleGithubCallback(profile, ipAddress, userAgent) {
        let user = await this.prisma.user.findUnique({
            where: { githubId: profile.id },
        });
        if (!user) {
            const existingByEmail = await this.prisma.user.findUnique({
                where: { email: profile.email },
            });
            if (existingByEmail) {
                user = await this.prisma.user.update({
                    where: { id: existingByEmail.id },
                    data: {
                        githubId: profile.id,
                        githubUrl: `https://github.com/${profile.username}`,
                        emailVerified: true,
                    },
                });
            }
            else {
                user = await this.prisma.$transaction(async (tx) => {
                    const newUser = await tx.user.create({
                        data: {
                            username: await this.generateUniqueUsername(profile.username),
                            fullName: profile.displayName || profile.username,
                            email: profile.email,
                            githubId: profile.id,
                            githubUrl: `https://github.com/${profile.username}`,
                            avatarUrl: profile.avatarUrl,
                            emailVerified: true,
                            role: 'user',
                            availabilityStatus: 'inactive',
                        },
                    });
                    await tx.userStats.create({ data: { userId: newUser.id } });
                    await tx.userPreferences.create({ data: { userId: newUser.id } });
                    return newUser;
                });
            }
        }
        const { refreshToken } = await this.sessionService.createSession(user.id, ipAddress, userAgent);
        await this.auditService.log('oauth_login', user.id, ipAddress, userAgent, {
            provider: 'github',
        });
        return this.buildAuthResult(user, refreshToken);
    }
    async handleGoogleCallback(profile, ipAddress, userAgent) {
        let user = await this.prisma.user.findUnique({
            where: { googleId: profile.id },
        });
        if (!user) {
            const existingByEmail = await this.prisma.user.findUnique({
                where: { email: profile.email },
            });
            if (existingByEmail) {
                user = await this.prisma.user.update({
                    where: { id: existingByEmail.id },
                    data: { googleId: profile.id, emailVerified: true },
                });
            }
            else {
                const baseUsername = profile.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
                user = await this.prisma.$transaction(async (tx) => {
                    const newUser = await tx.user.create({
                        data: {
                            username: await this.generateUniqueUsername(baseUsername),
                            fullName: profile.displayName,
                            email: profile.email,
                            googleId: profile.id,
                            avatarUrl: profile.avatarUrl,
                            emailVerified: true,
                            role: 'user',
                            availabilityStatus: 'inactive',
                        },
                    });
                    await tx.userStats.create({ data: { userId: newUser.id } });
                    await tx.userPreferences.create({ data: { userId: newUser.id } });
                    return newUser;
                });
            }
        }
        const { refreshToken } = await this.sessionService.createSession(user.id, ipAddress, userAgent);
        await this.auditService.log('oauth_login', user.id, ipAddress, userAgent, {
            provider: 'google',
        });
        return this.buildAuthResult(user, refreshToken);
    }
    async getMe(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                fullName: true,
                email: true,
                avatarUrl: true,
                role: true,
                emailVerified: true,
                college: true,
                year: true,
                githubUrl: true,
                linkedinUrl: true,
                lookingForTeam: true,
                availabilityStatus: true,
                githubId: true,
                googleId: true,
                createdAt: true,
            },
        });
    }
    buildAuthResult(user, refreshToken) {
        const accessToken = this.tokenService.generateAccessToken({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                avatarUrl: user.avatarUrl,
                role: user.role,
            },
        };
    }
    async generateUniqueUsername(base) {
        let username = base.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 40);
        let attempt = 0;
        while (true) {
            const candidate = attempt === 0 ? username : `${username}_${attempt}`;
            const exists = await this.prisma.user.findUnique({ where: { username: candidate } });
            if (!exists)
                return candidate;
            attempt++;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        token_service_1.TokenService,
        session_service_1.SessionService,
        audit_service_1.AuditService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map