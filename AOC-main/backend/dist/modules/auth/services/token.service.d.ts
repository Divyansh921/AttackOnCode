import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export interface JwtPayload {
    sub: string;
    username: string;
    email: string;
    role: string;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export declare class TokenService {
    private jwt;
    private config;
    constructor(jwt: JwtService, config: ConfigService);
    generateAccessToken(user: {
        id: string;
        username: string;
        email: string;
        role: string;
    }): string;
    verifyAccessToken(token: string): JwtPayload;
    generateRefreshToken(): string;
    hashToken(token: string): string;
    generateEmailVerifyToken(): string;
    generatePasswordResetToken(): string;
    getAccessTokenCookieOptions(): {
        httpOnly: boolean;
        secure: boolean;
        sameSite: "lax";
        path: string;
        maxAge: number;
    };
    getRefreshTokenCookieOptions(): {
        httpOnly: boolean;
        secure: boolean;
        sameSite: "lax";
        path: string;
        maxAge: number;
    };
}
