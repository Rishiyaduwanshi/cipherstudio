import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { config as serverConfig } from '@server/config';

export function middleware(request) {
  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/api/users', '/api/users/login'];
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route)
  );
  
  // If it's a public route, continue
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // If no token and accessing protected API route
  if (!token && request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({
      message: 'Authentication required',
      statusCode: 401,
      success: false,
      data: null,
      errors: [{ field: 'auth', message: 'Please login to access this resource' }],
      timestamp: new Date().toISOString()
    }, { status: 401 });
  }
  
  // Verify token for API routes
  if (token && request.nextUrl.pathname.startsWith('/api/')) {
    try {
      const decoded = jwt.verify(token, serverConfig.JWT_SECRET);
      
      // Add user info to request headers for API routes to use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.userId);
      requestHeaders.set('x-user-email', decoded.email);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Token verification failed:', error);
      
      // Clear invalid token
      const response = NextResponse.json({
        message: 'Invalid or expired token',
        statusCode: 401,
        success: false,
        data: null,
        errors: [{ field: 'auth', message: 'Please login again' }],
        timestamp: new Date().toISOString()
      }, { status: 401 });
      
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });
      
      return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/((?!users$|users/login$).*)' // Match all API routes except /api/users and /api/users/login
  ]
};