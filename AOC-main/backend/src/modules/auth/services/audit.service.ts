import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    action: AuditAction,
    userId: string | null,
    ipAddress?: string,
    userAgent?: string,
    metadata: Record<string, any> = {},
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        ipAddress,
        userAgent,
        metadata,
      },
    });
  }

  async getLogsForUser(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getRecentFailedLogins(ipAddress: string, windowMinutes = 15): Promise<number> {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);
    return this.prisma.auditLog.count({
      where: {
        action: 'login_failed',
        ipAddress,
        createdAt: { gte: since },
      },
    });
  }
}
