import { NextResponse } from 'next/server';

const publicPaths = new Set([
  '/',
  '/favicon.ico'
]);

export function middleware(request) {
  const { pathname } = request.nextUrl;
  console.log('Middleware - Checking path:', pathname);

  // Skip middleware for public paths and static files
  if (publicPaths.has(pathname) || 
      pathname.startsWith('/_next/') || 
      pathname.endsWith('.ico')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|assets|favicon.ico).*)',
  ]
};
