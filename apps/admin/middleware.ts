import { NextRequest } from 'next/server';
import { adminAuthMiddleware } from './middleware/adminAuth';

export function middleware(req: NextRequest) {
  return adminAuthMiddleware(req);
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
