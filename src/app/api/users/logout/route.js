import { NextResponse } from 'next/server';

// POST /api/users/logout - User logout
export async function POST(request) {
  try {
    const response = NextResponse.json({
      message: 'Logout successful',
      statusCode: 200,
      success: true,
      data: null,
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
    // Clear the auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    
    return NextResponse.json({
      message: 'Internal server error',
      statusCode: 500,
      success: false,
      data: null,
      errors: [{ field: 'server', message: 'An unexpected error occurred during logout' }],
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}