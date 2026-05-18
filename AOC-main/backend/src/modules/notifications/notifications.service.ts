import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // ── GET USER NOTIFICATIONS ────────────────────────────────────────────

  async getUserNotifications(userId: string, unreadOnly = false, page = 1, limit = 20) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      data: notifications,
      unreadCount,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── MARK AS READ ──────────────────────────────────────────────────────

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  // ── MARK ALL AS READ ──────────────────────────────────────────────────

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  // ── SEND NOTIFICATION ─────────────────────────────────────────────────
  // Called by other services

  async send(
    userId: string,
    type: NotificationType,
    title: string,
    message?: string,
    link?: string,
  ) {
    return this.prisma.notification.create({
      data: { userId, type, title, message, link },
    });
  }

  // ── BULK SEND ─────────────────────────────────────────────────────────
  // Notify multiple users (e.g., all team members)

  async sendToMany(
    userIds: string[],
    type: NotificationType,
    title: string,
    message?: string,
    link?: string,
  ) {
    return this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type,
        title,
        message,
        link,
      })),
    });
  }
}
