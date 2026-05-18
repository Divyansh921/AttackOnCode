import { PrismaService } from '../../common/prisma/prisma.service';
import { ActivityType, EntityType } from '@prisma/client';
export declare class ActivityService {
    private prisma;
    constructor(prisma: PrismaService);
    getGlobalFeed(page?: any, limit?: any): Promise<{
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
    getUserFeed(userId: string, page?: any, limit?: any): Promise<{
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
    getEntityFeed(entityType: EntityType, entityId: string, page?: any, limit?: any): Promise<{
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
    log(userId: string, activityType: ActivityType, entityType: EntityType, entityId: string, metadata?: Record<string, any>): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        activityType: import(".prisma/client").$Enums.ActivityType;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
    }>;
}
