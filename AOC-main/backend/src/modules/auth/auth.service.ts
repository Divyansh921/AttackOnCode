import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TokenService, JwtPayload } from './services/token.service';
import { SessionService } from './services/session.service';
import { AuditService } from './services/audit.service';
import { EmailService } from './services/email.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private sessionService: SessionService,
    private auditService: AuditService,
    private emailService: EmailService,
  ) {}

  // ── REGISTER ──────────────────────────────────────────────────────────

  async register(
    dto: RegisterDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResult> {
    // Check duplicates
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ username: dto.username }, { email: dto.email }] },
    });

    if (existing) {
      const field = existing.username === dto.username ? 'Username' : 'Email';
      throw new ConflictException(`${field} already taken`);
    }

    // Hash password with Argon2id
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,  // 64 MB
      timeCost: 3,
      parallelism: 4,
    });

    // Generate email verification token
    const emailVerifyToken = this.tokenService.generateEmailVerifyToken();

    // Create user + stats + preferences in transaction
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

    // Create session
    const { refreshToken } = await this.sessionService.createSession(
      user.id,
      ipAddress,
      userAgent,
    );

    // Audit log
    await this.auditService.log('register', user.id, ipAddress, userAgent, {
      email: user.email,
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, emailVerifyToken);

    return this.buildAuthResult(user, refreshToken);
  }

  // ── LOGIN ─────────────────────────────────────────────────────────────

  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResult> {
    // Rate limit check: brute force prevention
    const recentFailures = await this.auditService.getRecentFailedLogins(
      ipAddress || '',
      15,
    );
    if (recentFailures >= 10) {
      throw new ForbiddenException(
        'Too many failed login attempts. Please try again in 15 minutes.',
      );
    }

    // Find user
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
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      await this.auditService.log('login_failed', user.id, ipAddress, userAgent, {
        reason: 'wrong_password',
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create session
    const { refreshToken } = await this.sessionService.createSession(
      user.id,
      ipAddress,
      userAgent,
    );

    // Audit log
    await this.auditService.log('login_success', user.id, ipAddress, userAgent);

    return this.buildAuthResult(user, refreshToken);
  }

  // ── REFRESH TOKEN ─────────────────────────────────────────────────────

  async refreshToken(
    refreshToken: string,
    ipAddress?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const result = await this.sessionService.validateAndRotate(refreshToken, ipAddress);

    if (!result) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: result.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
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

  // ── LOGOUT ────────────────────────────────────────────────────────────

  async logout(
    refreshToken: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const tokenHash = this.tokenService.hashToken(refreshToken);

    // Find and revoke the specific session
    const session = await this.prisma.session.findFirst({
      where: { refreshTokenHash: tokenHash, userId },
    });

    if (session) {
      await this.sessionService.revokeSession(session.id, userId);
    }

    await this.auditService.log('logout', userId, ipAddress, userAgent);
  }

  // ── LOGOUT ALL DEVICES ────────────────────────────────────────────────

  async logoutAllDevices(userId: string, ipAddress?: string): Promise<void> {
    await this.sessionService.revokeAllSessions(userId);
    await this.auditService.log('session_revoked', userId, ipAddress, undefined, {
      scope: 'all_devices',
    });
  }

  // ── EMAIL VERIFICATION ────────────────────────────────────────────────

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { emailVerifyToken: token, emailVerified: false },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification link');
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

  // ── PASSWORD RESET REQUEST ────────────────────────────────────────────

  async requestPasswordReset(
    email: string,
    ipAddress?: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If an account exists, a reset link has been sent.' };
    }

    const resetToken = this.tokenService.generatePasswordResetToken();
    const tokenHash = this.tokenService.hashToken(resetToken);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await this.auditService.log('password_reset_request', user.id, ipAddress);

    // Send reset email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If an account exists, a reset link has been sent.' };
  }

  // ── PASSWORD RESET EXECUTE ────────────────────────────────────────────

  async resetPassword(
    token: string,
    newPassword: string,
    ipAddress?: string,
  ): Promise<{ message: string }> {
    const tokenHash = this.tokenService.hashToken(token);

    const resetRecord = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetRecord) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    await this.prisma.$transaction(async (tx) => {
      // Update password
      await tx.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      });

      // Mark token as used
      await tx.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      });

      // Revoke all sessions (security: force re-login everywhere)
      await tx.session.updateMany({
        where: { userId: resetRecord.userId },
        data: { revoked: true },
      });
    });

    await this.auditService.log('password_reset_complete', resetRecord.userId, ipAddress);

    return { message: 'Password reset successfully. Please log in again.' };
  }

  // ── GITHUB OAUTH CALLBACK ────────────────────────────────────────────

  async handleGithubCallback(
    profile: { id: string; username: string; displayName: string; email: string; avatarUrl?: string },
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResult> {
    let user = await this.prisma.user.findUnique({
      where: { githubId: profile.id },
    });

    if (!user) {
      // Check if email already exists (link accounts)
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (existingByEmail) {
        // Link GitHub to existing account
        user = await this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            githubId: profile.id,
            githubUrl: `https://github.com/${profile.username}`,
            emailVerified: true,
          },
        });
      } else {
        // Create new user from GitHub
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

    const { refreshToken } = await this.sessionService.createSession(
      user.id,
      ipAddress,
      userAgent,
    );

    await this.auditService.log('oauth_login', user.id, ipAddress, userAgent, {
      provider: 'github',
    });

    return this.buildAuthResult(user, refreshToken);
  }

  // ── GOOGLE OAUTH CALLBACK ────────────────────────────────────────────

  async handleGoogleCallback(
    profile: { id: string; displayName: string; email: string; avatarUrl?: string },
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResult> {
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
      } else {
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

    const { refreshToken } = await this.sessionService.createSession(
      user.id,
      ipAddress,
      userAgent,
    );

    await this.auditService.log('oauth_login', user.id, ipAddress, userAgent, {
      provider: 'google',
    });

    return this.buildAuthResult(user, refreshToken);
  }

  // ── GET CURRENT USER ──────────────────────────────────────────────────

  async getMe(userId: string) {
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

  // ── HELPERS ───────────────────────────────────────────────────────────

  private buildAuthResult(user: any, refreshToken: string): AuthResult {
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

  private async generateUniqueUsername(base: string): Promise<string> {
    let username = base.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 40);
    let attempt = 0;

    while (true) {
      const candidate = attempt === 0 ? username : `${username}_${attempt}`;
      const exists = await this.prisma.user.findUnique({ where: { username: candidate } });
      if (!exists) return candidate;
      attempt++;
    }
  }
}
