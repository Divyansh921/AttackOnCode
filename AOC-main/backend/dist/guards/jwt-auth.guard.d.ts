import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface JwtPayload {
    sub: string;
    username: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
export declare class JwtAuthGuard implements CanActivate {
    private config;
    constructor(config: ConfigService);
    canActivate(context: ExecutionContext): boolean;
    private extractToken;
}
