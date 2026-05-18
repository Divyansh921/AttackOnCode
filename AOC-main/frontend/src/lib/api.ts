// ============================================================================
// CORE API CLIENT
// Every service calls through this. Never use fetch() directly in components.
//
// Responsibilities:
// - Base URL management
// - Auth header injection
// - Token refresh on 401
// - Error normalization
// - Request/response interceptors
// ============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// ── TOKEN MANAGEMENT ────────────────────────────────────────────────────
// In production, use HTTP-only cookies. This is a client-side fallback.

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// ── ERROR TYPE ──────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorMessage: string,
    public details?: any,
  ) {
    super(errorMessage);
    this.name = 'ApiError';
  }
}

// ── CORE REQUEST FUNCTION ───────────────────────────────────────────────

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, params } = options;

  // Build URL with query params
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Inject auth token
  if (accessToken) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  // Execute request
  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // for HTTP-only cookies
  });

  // Handle errors
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));

    // Auto-refresh on 401
    if (response.status === 401 && accessToken) {
      const refreshed = await attemptTokenRefresh();
      if (refreshed) {
        // Retry original request with new token
        requestHeaders['Authorization'] = `Bearer ${accessToken}`;
        const retryResponse = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          credentials: 'include',
        });
        if (retryResponse.ok) {
          return retryResponse.json();
        }
      }
      // If refresh failed, clear auth state
      setAccessToken(null);
    }

    throw new ApiError(
      response.status,
      errorBody.message || 'Something went wrong',
      errorBody,
    );
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ── TOKEN REFRESH ───────────────────────────────────────────────────────

let refreshPromise: Promise<boolean> | null = null;

async function attemptTokenRefresh(): Promise<boolean> {
  // Deduplicate concurrent refresh attempts
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      setAccessToken(data.accessToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ── CONVENIENCE METHODS ─────────────────────────────────────────────────

export const api = {
  get<T>(endpoint: string, params?: Record<string, any>) {
    return request<T>(endpoint, { method: 'GET', params });
  },

  post<T>(endpoint: string, body?: any) {
    return request<T>(endpoint, { method: 'POST', body });
  },

  patch<T>(endpoint: string, body?: any) {
    return request<T>(endpoint, { method: 'PATCH', body });
  },

  put<T>(endpoint: string, body?: any) {
    return request<T>(endpoint, { method: 'PUT', body });
  },

  delete<T>(endpoint: string) {
    return request<T>(endpoint, { method: 'DELETE' });
  },
};
