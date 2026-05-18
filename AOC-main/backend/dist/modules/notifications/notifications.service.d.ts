import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationType } from '@prisma/client';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserNotifications(userId: string, unreadOnly?: boolean, page?: number, limit?: number): Promise<{
        data: {
            link: string | null;
            id: string;
            createdAt: Date;
            userId: string;
            type: import(".prisma/client").$Enums.NotificationType;
            title: string;
            message: string | null;
            isRead: boolean;
        }[];
        unreadCount: number;
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    markAsRead(notificationId: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    send(userId: string, type: NotificationType, title: string, message?: string, link?: string): Promise<{
        link: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string | null;
        isRead: boolean;
    }>;
    sendToMany(userIds: string[], type: NotificationType, title: string, message?: string, link?: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
