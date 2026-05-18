import { PrismaService } from '../../common/prisma/prisma.service';
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';
import { AuditService } from './services/audit.service';
import { EmailService } from './services/email.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export interface AuthResult {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        username: string;
        fullName: string;
        email: string;
        avatarUrl: string | null;
        role: string;
    };
}
export declare class AuthService {
    private prisma;
    private tokenService;
    private sessionService;
    private auditService;
    private emailService;
    constructor(prisma: PrismaService, tokenService: TokenService, sessionService: SessionService, auditService: AuditService, emailService: EmailService);
    register(dto: RegisterDto, ipAddress?: string, userAgent?: string): Promise<AuthResult>;
    login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResult>;
    refreshToken(refreshToken: string, ipAddress?: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string, userId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logoutAllDevices(userId: string, ipAddress?: string): Promise<void>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    requestPasswordReset(email: string, ipAddress?: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string, ipAddress?: string): Promise<{
        message: string;
    }>;
    handleGithubCallback(profile: {
        id: string;
        username: string;
        displayName: string;
        email: string;
        avatarUrl?: string;
    }, ipAddress?: string, userAgent?: string): Promise<AuthResult>;
    handleGoogleCallback(profile: {
        id: string;
        displayName: string;
        email: string;
        avatarUrl?: string;
    }, ipAddress?: string, userAgent?: string): Promise<AuthResult>;
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
    private buildAuthResult;
    private generateUniqueUsername;
}
