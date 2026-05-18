import { Controller, Post, Get, Delete, Body, Param, Req, Res, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { SessionService } from './services/session.service';
import { TokenService } from './services/token.service';
import { RegisterDto, LoginDto, PasswordResetRequestDto, PasswordResetDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private tokenService: TokenService,
    private config: ConfigService,
  ) {}

  // ── REGISTER ──────────────────────────────────────────────────────────

  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 registrations per minute
  @ApiOperation({ summary: 'Create a new builder account' })
  @ApiResponse({ status: 201, description: 'Account created, tokens set as cookies' })
  @ApiResponse({ status: 409, description: 'Username or email already taken' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];

    const result = await this.authService.register(dto, ip, ua);

    // Set HTTP-only cookies
    res.cookie('access_token', result.accessToken, this.tokenService.getAccessTokenCookieOptions());
    res.cookie('refresh_token', result.refreshToken, this.tokenService.getRefreshTokenCookieOptions());

    return {
      user: result.user,
      accessToken: result.accessToken, // also in body for non-cookie clients
    };
  }

  // ── LOGIN ─────────────────────────────────────────────────────────────

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 10 } }) // 10 login attempts per minute
  @ApiOperation({ summary: 'Authenticate with email/username and password' })
  @ApiResponse({ status: 200, description: 'Tokens set as cookies' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Too many failed attempts' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
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

  // ── REFRESH TOKEN ─────────────────────────────────────────────────────

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token (uses cookie or body)' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { refreshToken?: string },
  ) {
    // Try cookie first, then body
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

  // ── LOGOUT ────────────────────────────────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current session' })
  async logout(
    @CurrentUser('sub') userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];

    if (refreshToken) {
      await this.authService.logout(refreshToken, userId, ip, ua);
    }

    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });

    return { message: 'Logged out successfully' };
  }

  // ── LOGOUT ALL DEVICES ────────────────────────────────────────────────

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all sessions (logout everywhere)' })
  async logoutAll(
    @CurrentUser('sub') userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    await this.authService.logoutAllDevices(userId, ip);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });

    return { message: 'All sessions revoked' };
  }

  // ── GET CURRENT USER ──────────────────────────────────────────────────

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user profile' })
  async getMe(@CurrentUser('sub') userId: string) {
    return this.authService.getMe(userId);
  }

  // ── GET SESSIONS ──────────────────────────────────────────────────────

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active sessions (multi-device dashboard)' })
  async getSessions(@CurrentUser('sub') userId: string) {
    return this.sessionService.getUserSessions(userId);
  }

  // ── REVOKE SESSION ────────────────────────────────────────────────────

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific session (logout device)' })
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.sessionService.revokeSession(sessionId, userId);
    return { message: 'Session revoked' };
  }

  // ── EMAIL VERIFICATION ────────────────────────────────────────────────

  @Post('verify-email/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // ── PASSWORD RESET REQUEST ────────────────────────────────────────────

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 3 } }) // 3 per minute
  @ApiOperation({ summary: 'Request password reset email' })
  async forgotPassword(
    @Body() dto: PasswordResetRequestDto,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.authService.requestPasswordReset(dto.email, ip);
  }

  // ── PASSWORD RESET EXECUTE ────────────────────────────────────────────

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(
    @Body() dto: PasswordResetDto,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.authService.resetPassword(dto.token, dto.newPassword, ip);
  }

  // ── GITHUB OAUTH (TEMPORARILY DISABLED) ─────────────────────────────────
  /*
  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Redirect to GitHub OAuth' })
  async githubRedirect() {
    // Passport handles redirect
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubCallback(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];
    const githubProfile = req.user as any;

    const result = await this.authService.handleGithubCallback(githubProfile, ip, ua);

    // Set cookies
    res.cookie('access_token', result.accessToken, this.tokenService.getAccessTokenCookieOptions());
    res.cookie('refresh_token', result.refreshToken, this.tokenService.getRefreshTokenCookieOptions());

    // Redirect back to frontend
    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
    return res.redirect(`${frontendUrl}/dashboard`);
  }
  */
}
