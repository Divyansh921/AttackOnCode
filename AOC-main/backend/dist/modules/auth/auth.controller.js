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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./auth.service");
const session_service_1 = require("./services/session.service");
const token_service_1 = require("./services/token.service");
const auth_dto_1 = require("./dto/auth.dto");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AuthController = class AuthController {
    constructor(authService, sessionService, tokenService, config) {
        this.authService = authService;
        this.sessionService = sessionService;
        this.tokenService = tokenService;
        this.config = config;
    }
    async register(dto, req, res) {
        const ip = req.ip || req.socket.remoteAddress;
        const ua = req.headers['user-agent'];
        const result = await this.authService.register(dto, ip, ua);
        res.cookie('access_token', result.accessToken, this.tokenService.getAccessTokenCookieOptions());
        res.cookie('refresh_token', result.refreshToken, this.tokenService.getRefreshTokenCookieOptions());
        return {
            user: result.user,
            accessToken: result.accessToken,
        };
    }
    async login(dto, req, res) {
        const ip = req.ip || req.socket.remoteAddress;
        const ua = req.headers['user-agent'];
        const result = await this.authService.login(dto, ip, ua);
        res.cookie('access_token', result.accessToken, this.tokenService.getAccessTokenCookieOptions());
        res.cookie('refresh_token', result.refreshToken, this.tokenService.getRefreshTokenCookieOptions());
        return {
            user: result.user,
            accessToken: result.accessToken,
        };
    }
    async refresh(req, res, body) {
        const refreshToken = req.cookies?.refresh_token || body.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }
        const ip = req.ip || req.socket.remoteAddress;
        const result = await this.authService.refreshToken(refreshToken, ip);
        res.cookie('access_token', result.accessToken, this.tokenService.getAccessTokenCookieOptions());
        res.cookie('refresh_token', result.refreshToken, this.tokenService.getRefreshTokenCookieOptions());
        return { accessToken: result.accessToken };
    }
    async logout(userId, req, res) {
        const refreshToken = req.cookies?.refresh_token;
        const ip = req.ip || req.socket.remoteAddress;
        const ua = req.headers['user-agent'];
        if (refreshToken) {
            await this.authService.logout(refreshToken, userId, ip, ua);
        }
        res.clearCookie('access_token');
        res.clearCookie('refresh_token', { path: '/api/v1/auth' });
        return { message: 'Logged out successfully' };
    }
    async logoutAll(userId, req, res) {
        const ip = req.ip || req.socket.remoteAddress;
        await this.authService.logoutAllDevices(userId, ip);
        res.clearCookie('access_token');
        res.clearCookie('refresh_token', { path: '/api/v1/auth' });
        return { message: 'All sessions revoked' };
    }
    async getMe(userId) {
        return this.authService.getMe(userId);
    }
    async getSessions(userId) {
        return this.sessionService.getUserSessions(userId);
    }
    async revokeSession(sessionId, userId) {
        await this.sessionService.revokeSession(sessionId, userId);
        return { message: 'Session revoked' };
    }
    async verifyEmail(token) {
        return this.authService.verifyEmail(token);
    }
    async forgotPassword(dto, req) {
        const ip = req.ip || req.socket.remoteAddress;
        return this.authService.requestPasswordReset(dto.email, ip);
    }
    async resetPassword(dto, req) {
        const ip = req.ip || req.socket.remoteAddress;
        return this.authService.resetPassword(dto.token, dto.newPassword, ip);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 5 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new builder account' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Account created, tokens set as cookies' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Username or email already taken' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 10 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Authenticate with email/username and password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tokens set as cookies' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Too many failed attempts' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token (uses cookie or body)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Logout current session' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('logout-all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke all sessions (logout everywhere)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutAll", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get authenticated user profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)('sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List active sessions (multi-device dashboard)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getSessions", null);
__decorate([
    (0, common_1.Delete)('sessions/:sessionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke a specific session (logout device)' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeSession", null);
__decorate([
    (0, common_1.Post)('verify-email/:token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify email address' }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 3 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset email' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.PasswordResetRequestDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password with token' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.PasswordResetDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        session_service_1.SessionService,
        token_service_1.TokenService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map