"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
let TokenService = class TokenService {
    constructor(jwt, config) {
        this.jwt = jwt;
        this.config = config;
    }
    generateAccessToken(user) {
        return this.jwt.sign({ sub: user.id, username: user.username, email: user.email, role: user.role }, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
        });
    }
    verifyAccessToken(token) {
        return this.jwt.verify(token, {
            secret: this.config.get('JWT_SECRET'),
        });
    }
    generateRefreshToken() {
        return crypto.randomBytes(64).toString('hex');
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    generateEmailVerifyToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    generatePasswordResetToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    getAccessTokenCookieOptions() {
        return {
            httpOnly: true,
            secure: this.config.get('NODE_ENV') === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60 * 1000,
        };
    }
    getRefreshTokenCookieOptions() {
        return {
            httpOnly: true,
            secure: this.config.get('NODE_ENV') === 'production',
            sameSite: 'lax',
            path: '/api/v1/auth',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], TokenService);
//# sourceMappingURL=token.service.js.map