import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditAction } from '@prisma/client';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(action: AuditAction, userId: string | null, ipAddress?: string, userAgent?: string, metadata?: Record<string, any>): Promise<void>;
    getLogsForUser(userId: string, limit?: number): Promise<{
        id: string;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
        userId: string | null;
        action: import(".prisma/client").$Enums.AuditAction;
        metadata: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getRecentFailedLogins(ipAddress: string, windowMinutes?: number): Promise<number>;
}
