import { PrismaService } from '../../../common/prisma/prisma.service';
import { TokenService } from './token.service';
export declare class SessionService {
    private prisma;
    private tokenService;
    constructor(prisma: PrismaService, tokenService: TokenService);
    createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<{
        refreshToken: string;
        sessionId: string;
    }>;
    validateAndRotate(refreshToken: string, ipAddress?: string): Promise<{
        userId: string;
        newRefreshToken: string;
        sessionId: string;
    } | null>;
    revokeSession(sessionId: string, userId: string): Promise<void>;
    revokeAllSessions(userId: string, exceptSessionId?: string): Promise<void>;
    getUserSessions(userId: string): Promise<{
        id: string;
        deviceInfo: string | null;
        ipAddress: string | null;
        createdAt: Date;
        lastUsedAt: Date;
    }[]>;
    cleanupExpiredSessions(): Promise<number>;
    private parseDeviceInfo;
}
