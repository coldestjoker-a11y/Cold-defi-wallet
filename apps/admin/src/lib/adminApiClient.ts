/**
 * Admin API Client
 * Isolated client for talking strictly to the DeFi Orchestrator Admin endpoints
 */

const ADMIN_API_BASE =
  process.env.NEXT_PUBLIC_ADMIN_API_URL !== undefined
    ? process.env.NEXT_PUBLIC_ADMIN_API_URL
    : (typeof window !== 'undefined' ? '' : 'http://localhost:8000');

export interface AdminApiResponse<T = any> {
  status: string;
  data?: T;
  error?: string;
  [key: string]: any;
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_access_token');
}

export function setAdminToken(token: string, refreshToken?: string, user?: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('admin_access_token', token);
  if (refreshToken) localStorage.setItem('admin_refresh_token', refreshToken);
  if (user) localStorage.setItem('admin_user', JSON.stringify(user));
}

export function clearAdminSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_refresh_token');
  localStorage.removeItem('admin_user');
}

export function getAdminUser(): any | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('admin_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export async function adminFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const url = `${ADMIN_API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include httpOnly cookies
    headers,
  });

  if (response.status === 401) {
    clearAdminSession();
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login?expired=1';
    }
    const err = await response.json().catch(() => ({ detail: 'Unauthorized' }));
    throw new Error(err.detail || 'Admin session unauthorized or expired');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
    throw new Error(err.detail || err.message || `Request failed with code ${response.status}`);
  }

  return response.json();
}
