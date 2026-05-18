import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(userId: string, unreadOnly?: boolean, page?: number, limit?: number): Promise<{
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
    markAsRead(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
