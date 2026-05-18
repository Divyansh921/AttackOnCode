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
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const token_service_1 = require("./token.service");
let SessionService = class SessionService {
    constructor(prisma, tokenService) {
        this.prisma = prisma;
        this.tokenService = tokenService;
    }
    async createSession(userId, ipAddress, userAgent) {
        const refreshToken = this.tokenService.generateRefreshToken();
        const refreshTokenHash = this.tokenService.hashToken(refreshToken);
        const deviceInfo = this.parseDeviceInfo(userAgent);
        const session = await this.prisma.session.create({
            data: {
                userId,
                refreshTokenHash,
                deviceInfo,
                ipAddress,
                userAgent,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return { refreshToken, sessionId: session.id };
    }
    async validateAndRotate(refreshToken, ipAddress) {
        const tokenHash = this.tokenService.hashToken(refreshToken);
        const session = await this.prisma.session.findFirst({
            where: {
                refreshTokenHash: tokenHash,
                revoked: false,
                expiresAt: { gt: new Date() },
            },
        });
        if (!session)
            return null;
        const newRefreshToken = this.tokenService.generateRefreshToken();
        const newHash = this.tokenService.hashToken(newRefreshToken);
        await this.prisma.session.update({
            where: { id: session.id },
            data: {
                refreshTokenHash: newHash,
                lastUsedAt: new Date(),
                ipAddress: ipAddress || session.ipAddress,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return {
            userId: session.userId,
            newRefreshToken,
            sessionId: session.id,
        };
    }
    async revokeSession(sessionId, userId) {
        await this.prisma.session.updateMany({
            where: { id: sessionId, userId },
            data: { revoked: true },
        });
    }
    async revokeAllSessions(userId, exceptSessionId) {
        await this.prisma.session.updateMany({
            where: {
                userId,
                revoked: false,
                ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
            },
            data: { revoked: true },
        });
    }
    async getUserSessions(userId) {
        return this.prisma.session.findMany({
            where: {
                userId,
                revoked: false,
                expiresAt: { gt: new Date() },
            },
            select: {
                id: true,
                deviceInfo: true,
                ipAddress: true,
                createdAt: true,
                lastUsedAt: true,
            },
            orderBy: { lastUsedAt: 'desc' },
        });
    }
    async cleanupExpiredSessions() {
        const result = await this.prisma.session.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    { revoked: true, lastUsedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                ],
            },
        });
        return result.count;
    }
    parseDeviceInfo(userAgent) {
        if (!userAgent)
            return 'Unknown Device';
        if (userAgent.includes('Mobile'))
            return 'Mobile';
        if (userAgent.includes('Chrome'))
            return 'Chrome Desktop';
        if (userAgent.includes('Firefox'))
            return 'Firefox Desktop';
        if (userAgent.includes('Safari'))
            return 'Safari Desktop';
        if (userAgent.includes('Edge'))
            return 'Edge Desktop';
        return 'Desktop Browser';
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        token_service_1.TokenService])
], SessionService);
//# sourceMappingURL=session.service.js.map