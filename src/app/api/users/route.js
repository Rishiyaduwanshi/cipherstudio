import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@server/db/connect';
import User from '@server/models/User';
import { AppError, BadRequestError, UnauthorizedError } from '@server/utils/appError';
import { generateAuthToken } from '@server/utils/auth';
import { config } from '@server/config';
import { userRegistrationSchema } from '@server/validations/userValidation';
import { validateData, createValidationErrorResponse } from '@server/validations';

// POST /api/users - Register new user
export async function POST(request) {
  try {
    await connectDB();
    
    const requestBody = await request.json();
    
    // Validate request data using Zod schema
    const validation = await validateData(userRegistrationSchema, requestBody);
    if (!validation.success) {
      const errorResponse = createValidationErrorResponse(
        validation.errors,
        validation.message
      );
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    const { firstName, lastName, email, password, mobile } = validation.data;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({
        message: 'User already exists with this email',
        statusCode: 409,
        success: false,
        data: null,
        errors: [{ field: 'email', message: 'Email address is already registered' }],
        timestamp: new Date().toISOString()
      }, { status: 409 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      mobile: mobile || undefined,
      settings: {
        theme: 'dark'
      }
    });
    
    const savedUser = await newUser.save();
    
    // Generate JWT token
    const token = generateAuthToken({
      userId: savedUser._id,
      email: savedUser.email
    });
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = savedUser.toObject();
    
    return NextResponse.json({
      message: 'User registered successfully',
      statusCode: 201,
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      timestamp: new Date().toISOString()
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating user:', error);
    
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
      errors: [{ field: 'server', message: 'An unexpected error occurred' }],
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}