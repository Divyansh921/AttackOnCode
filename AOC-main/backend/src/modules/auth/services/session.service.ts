import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { TokenService } from './token.service';

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  // ── CREATE SESSION ────────────────────────────────────────────────────

  async createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ refreshToken: string; sessionId: string }> {
    const refreshToken = this.tokenService.generateRefreshToken();
    const refreshTokenHash = this.tokenService.hashToken(refreshToken);

    // Parse device info from user agent
    const deviceInfo = this.parseDeviceInfo(userAgent);

    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        deviceInfo,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { refreshToken, sessionId: session.id };
  }

  // ── VALIDATE & ROTATE REFRESH TOKEN ───────────────────────────────────

  async validateAndRotate(
    refreshToken: string,
    ipAddress?: string,
  ): Promise<{ userId: string; newRefreshToken: string; sessionId: string } | null> {
    const tokenHash = this.tokenService.hashToken(refreshToken);

    const session = await this.prisma.session.findFirst({
      where: {
        refreshTokenHash: tokenHash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) return null;

    // ── ROTATE: generate new refresh token, invalidate old ─────────
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

  // ── REVOKE SESSION ────────────────────────────────────────────────────

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: { revoked: true },
    });
  }

  // ── REVOKE ALL SESSIONS ───────────────────────────────────────────────

  async revokeAllSessions(userId: string, exceptSessionId?: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        userId,
        revoked: false,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
      },
      data: { revoked: true },
    });
  }

  // ── GET USER SESSIONS ─────────────────────────────────────────────────

  async getUserSessions(userId: string) {
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

  // ── CLEANUP EXPIRED SESSIONS ──────────────────────────────────────────

  async cleanupExpiredSessions(): Promise<number> {
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

  // ── HELPERS ───────────────────────────────────────────────────────────

  private parseDeviceInfo(userAgent?: string): string {
    if (!userAgent) return 'Unknown Device';

    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Chrome')) return 'Chrome Desktop';
    if (userAgent.includes('Firefox')) return 'Firefox Desktop';
    if (userAgent.includes('Safari')) return 'Safari Desktop';
    if (userAgent.includes('Edge')) return 'Edge Desktop';
    return 'Desktop Browser';
  }
}
