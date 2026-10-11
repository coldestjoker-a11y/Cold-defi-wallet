import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Enterprise Admin Authentication Middleware
 * 
 * Verifies JWT tokens on incoming requests:
 * 1. Checks 'admin_token' cookie or 'Authorization: Bearer <token>' header
 * 2. Parses JWT claims and verifies user.role === 'admin'
 * 3. Checks token expiration (15-min TTL)
 * 4. Returns HTTP 401 JSON on API requests or redirects to /login for dashboard pages
 */

// Minimal zero-dependency edge JWT parser
function parseJwtPayload(token: string): { sub?: string; role?: string; exp?: number; [key: string]: any } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function adminAuthMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets, favicon, and login page
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon') ||
    pathname === '/login' ||
    pathname === '/api/admin/auth/login'
  ) {
    return NextResponse.next();
  }

  // 1. Check for token in cookie or Authorization header
  const tokenCookie = req.cookies.get('admin_token')?.value;
  const authHeader = req.headers.get('authorization');
  const token = tokenCookie || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'Missing admin authorization credentials' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Validate token payload and role
  const payload = parseJwtPayload(token);
  const nowInSec = Math.floor(Date.now() / 1000);

  if (!payload || !payload.exp || payload.exp < nowInSec) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized', detail: 'Admin session expired (15-minute TTL). Please re-authenticate.' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('expired', '1');
    return NextResponse.redirect(loginUrl);
  }

  // 3. Verify user.role === 'admin'
  if (payload.role !== 'admin') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Forbidden', detail: 'User lacks required admin role' },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
  }

  // Inject verified admin headers for downstream consumption
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-admin-user-id', payload.sub || '');
  requestHeaders.set('x-admin-role', payload.role || '');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
