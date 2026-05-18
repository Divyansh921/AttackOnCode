import { api, setAccessToken } from '@/lib/api';
import type { AuthResponse } from '@/types';

// ── Auth Service ────────────────────────────────────────────────────────
// All auth operations flow through here. Never call auth APIs directly.

export const authService = {
  async register(data: {
    username: string;
    fullName: string;
    email: string;
    password: string;
    college?: string;
    year?: number;
  }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse & { accessToken: string }>('/auth/register', data);
    setAccessToken(res.accessToken);
    return res;
  },

  async login(data: {
    emailOrUsername: string;
    password: string;
  }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse & { accessToken: string }>('/auth/login', data);
    setAccessToken(res.accessToken);
    return res;
  },

  async refresh(): Promise<{ accessToken: string }> {
    // Cookies are sent automatically — no need to manually send refresh token
    const res = await api.post<{ accessToken: string }>('/auth/refresh', {});
    setAccessToken(res.accessToken);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if API fails, clear local state
    }
    setAccessToken(null);
  },

  async logoutAllDevices(): Promise<void> {
    await api.post('/auth/logout-all');
    setAccessToken(null);
  },

  async getMe() {
    return api.get<{
      id: string;
      username: string;
      fullName: string;
      email: string;
      avatarUrl: string | null;
      role: string;
      emailVerified: boolean;
      college: string | null;
      githubId: string | null;
      googleId: string | null;
    }>('/auth/me');
  },

  async getSessions() {
    return api.get<Array<{
      id: string;
      deviceInfo: string | null;
      ipAddress: string | null;
      createdAt: string;
      lastUsedAt: string;
    }>>('/auth/sessions');
  },

  async revokeSession(sessionId: string) {
    return api.delete(`/auth/sessions/${sessionId}`);
  },

  async verifyEmail(token: string) {
    return api.post<{ message: string }>(`/auth/verify-email/${token}`);
  },

  async forgotPassword(email: string) {
    return api.post<{ message: string }>('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string) {
    return api.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  },

  getGithubOAuthUrl(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    return `${apiUrl}/auth/github`;
  },

  getGoogleOAuthUrl(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    return `${apiUrl}/auth/google`;
  },
};
