import { ActivityService } from './activity.service';
import { EntityType } from '@prisma/client';
export declare class ActivityController {
    private activityService;
    constructor(activityService: ActivityService);
    getGlobalFeed(page?: string, limit?: string): Promise<{
        data: ({
            user: {
                username: string;
                id: string;
                fullName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            activityType: import(".prisma/client").$Enums.ActivityType;
            entityType: import(".prisma/client").$Enums.EntityType;
            entityId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getUserFeed(userId: string, page?: string, limit?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            userId: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            activityType: import(".prisma/client").$Enums.ActivityType;
            entityType: import(".prisma/client").$Enums.EntityType;
            entityId: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getEntityFeed(entityType: EntityType, entityId: string, page?: string, limit?: string): Promise<{
        data: ({
            user: {
                username: string;
                id: string;
                fullName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            activityType: import(".prisma/client").$Enums.ActivityType;
            entityType: import(".prisma/client").$Enums.EntityType;
            entityId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
