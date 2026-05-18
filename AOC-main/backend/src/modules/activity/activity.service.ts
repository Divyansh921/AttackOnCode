import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ActivityType, EntityType } from '@prisma/client';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  // ── GLOBAL FEED ───────────────────────────────────────────────────────
  // Powers the home page live activity feed

  async getGlobalFeed(page: any = 1, limit: any = 20) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
      this.prisma.activity.count(),
    ]);

    return {
      data: activities,
      meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    };
  }

  // ── USER FEED ─────────────────────────────────────────────────────────
  // Activity history for a specific user profile

  async getUserFeed(userId: string, page: any = 1, limit: any = 20) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
      this.prisma.activity.count({ where: { userId } }),
    ]);

    return {
      data: activities,
      meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    };
  }

  // ── ENTITY FEED ───────────────────────────────────────────────────────
  // Activity for a specific team, project, or hackathon

  async getEntityFeed(entityType: EntityType, entityId: string, page: any = 1, limit: any = 20) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: { entityType, entityId },
        include: {
          user: {
            select: { id: true, username: true, fullName: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * l,
        take: l,
      }),
      this.prisma.activity.count({ where: { entityType, entityId } }),
    ]);

    return {
      data: activities,
      meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    };
  }

  // ── LOG ACTIVITY ──────────────────────────────────────────────────────
  // Called by other services to record events

  async log(
    userId: string,
    activityType: ActivityType,
    entityType: EntityType,
    entityId: string,
    metadata: Record<string, any> = {},
  ) {
    return this.prisma.activity.create({
      data: {
        userId,
        activityType,
        entityType,
        entityId,
        metadata,
      },
    });
  }
}
