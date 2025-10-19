import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@server/db/connect';
import User from '@server/models/User';
import { AppError, BadRequestError, UnauthorizedError } from '@server/utils/appError';
import { generateAuthToken } from '@server/utils/auth';
import { config } from '@server/config';
import { userLoginSchema } from '@server/validations/userValidation';
import { validateData, createValidationErrorResponse } from '@server/validations';

// POST /api/users/login - User login
export async function POST(request) {
  try {
    await connectDB();
    
    const requestBody = await request.json();
    
    // Validate request data using Zod schema
    const validation = await validateData(userLoginSchema, requestBody);
    if (!validation.success) {
      const errorResponse = createValidationErrorResponse(
        validation.errors,
        validation.message
      );
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    const { email, password } = validation.data;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({
        message: 'Invalid email or password',
        statusCode: 401,
        success: false,
        data: null,
        errors: [{ field: 'credentials', message: 'Email or password is incorrect' }],
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({
        message: 'Invalid email or password',
        statusCode: 401,
        success: false,
        data: null,
        errors: [{ field: 'credentials', message: 'Email or password is incorrect' }],
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }
    
    // Update last logged in time
    user.lastLoggedIn = new Date();
    await user.save();
    
    // Generate JWT token
    const token = generateAuthToken({
      userId: user._id,
      email: user.email
    });
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    // Create response with httpOnly cookie
    const response = NextResponse.json({
      message: 'Login successful',
      statusCode: 200,
      success: true,
      data: {
        user: userWithoutPassword
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
    // Set httpOnly cookie for authentication
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('Error during login:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json({
        message: error.message,
        statusCode: error.statusCode,
        success: false,
        data: null,
        errors: [{ field: 'server', message: error.message }],
        timestamp: new Date().toISOString()
      }, { status: error.statusCode });
    }
    
    return NextResponse.json({
      message: 'Internal server error',
      statusCode: 500,
      success: false,
      data: null,
      errors: [{ field: 'server', message: 'An unexpected error occurred during login' }],
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}