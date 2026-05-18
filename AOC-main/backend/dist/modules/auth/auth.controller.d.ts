import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { SessionService } from './services/session.service';
import { TokenService } from './services/token.service';
import { RegisterDto, LoginDto, PasswordResetRequestDto, PasswordResetDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    private sessionService;
    private tokenService;
    private config;
    constructor(authService: AuthService, sessionService: SessionService, tokenService: TokenService, config: ConfigService);
    register(dto: RegisterDto, req: Request, res: Response): Promise<{
        user: {
            id: string;
            username: string;
            fullName: string;
            email: string;
            avatarUrl: string | null;
            role: string;
        };
        accessToken: string;
    }>;
    login(dto: LoginDto, req: Request, res: Response): Promise<{
        user: {
            id: string;
            username: string;
            fullName: string;
            email: string;
            avatarUrl: string | null;
            role: string;
        };
        accessToken: string;
    }>;
    refresh(req: Request, res: Response, body: {
        refreshToken?: string;
    }): Promise<Response<any, Record<string, any>> | {
        accessToken: string;
    }>;
    logout(userId: string, req: Request, res: Response): Promise<{
        message: string;
    }>;
    logoutAll(userId: string, req: Request, res: Response): Promise<{
        message: string;
    }>;
    getMe(userId: string): Promise<{
        username: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        createdAt: Date;
        fullName: string;
        college: string | null;
        year: number | null;
        avatarUrl: string | null;
        githubUrl: string | null;
        linkedinUrl: string | null;
        lookingForTeam: boolean;
        availabilityStatus: import(".prisma/client").$Enums.AvailabilityStatus;
        emailVerified: boolean;
        githubId: string | null;
        googleId: string | null;
    } | null>;
    getSessions(userId: string): Promise<{
        id: string;
        deviceInfo: string | null;
        ipAddress: string | null;
        createdAt: Date;
        lastUsedAt: Date;
    }[]>;
    revokeSession(sessionId: string, userId: string): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    forgotPassword(dto: PasswordResetRequestDto, req: Request): Promise<{
        message: string;
    }>;
    resetPassword(dto: PasswordResetDto, req: Request): Promise<{
        message: string;
    }>;
}
