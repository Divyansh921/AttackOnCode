import { create } from 'zustand';
import { authService } from '@/services/auth.service';
import { setAccessToken } from '@/lib/api';

// ── Auth User Type ──────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  emailVerified: boolean;
}

// ── Auth Store ──────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    fullName: string;
    email: string;
    password: string;
    college?: string;
    year?: number;
  }) => Promise<void>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (emailOrUsername, password) => {
    const res = await authService.login({ emailOrUsername, password });
    set({
      user: {
        id: res.user.id,
        username: res.user.username,
        fullName: res.user.fullName,
        email: res.user.email,
        avatarUrl: res.user.avatarUrl,
        role: res.user.role,
        emailVerified: true, // logged in = email at minimum exists
      },
      isAuthenticated: true,
    });
  },

  register: async (data) => {
    const res = await authService.register(data);
    set({
      user: {
        id: res.user.id,
        username: res.user.username,
        fullName: res.user.fullName,
        email: res.user.email,
        avatarUrl: res.user.avatarUrl,
        role: res.user.role,
        emailVerified: false,
      },
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  logoutAllDevices: async () => {
    await authService.logoutAllDevices();
    set({ user: null, isAuthenticated: false });
  },

  // Called on app mount — attempt to restore session via HTTP-only cookie
  initialize: async () => {
    try {
      // Try refreshing — cookie is sent automatically
      const refreshResult = await authService.refresh();
      setAccessToken(refreshResult.accessToken);

      // Fetch user profile
      const user = await authService.getMe();
      set({
        user: user as AuthUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
}));
