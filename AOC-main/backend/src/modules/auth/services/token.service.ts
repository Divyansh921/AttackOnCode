import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

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

@Injectable()
export class TokenService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ── ACCESS TOKEN ──────────────────────────────────────────────────────

  generateAccessToken(user: { id: string; username: string; email: string; role: string }): string {
    return this.jwt.sign(
      { sub: user.id, username: user.username, email: user.email, role: user.role },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '15m'),
      },
    );
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.jwt.verify(token, {
      secret: this.config.get<string>('JWT_SECRET'),
    });
  }

  // ── REFRESH TOKEN ─────────────────────────────────────────────────────

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // ── EMAIL VERIFICATION TOKEN ──────────────────────────────────────────

  generateEmailVerifyToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // ── PASSWORD RESET TOKEN ──────────────────────────────────────────────

  generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // ── COOKIE CONFIGURATION ──────────────────────────────────────────────

  getAccessTokenCookieOptions() {
    return {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    };
  }

  getRefreshTokenCookieOptions() {
    return {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax' as const,
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
  }
}
