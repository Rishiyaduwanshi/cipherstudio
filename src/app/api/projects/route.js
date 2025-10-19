import { NextResponse } from 'next/server';
import connectDB from '@server/db/connect';
import Project from '@server/models/Project';
import File from '@server/models/File';
import { AppError, BadRequestError, UnauthorizedError, NotFoundError } from '@server/utils/appError';
import { verifyAuthToken } from '@server/utils/auth';
import { config } from '@server/config';
import { projectCreationSchema } from '@server/validations/projectValidation';
import { validateData, createValidationErrorResponse } from '@server/validations';

// GET /api/projects - Get user's projects
export async function GET(request) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    const authResult = verifyAuthToken(authHeader);
    
    if (!authResult.success) {
      return NextResponse.json({
        message: authResult.error,
        statusCode: 401,
        success: false,
        data: null,
        errors: [{ field: 'authorization', message: authResult.error }],
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }
    
    const projects = await Project.find({ userId: authResult.user.userId })
      .sort({ updatedAt: -1 })
      .populate('rootFolderId');
    
    return NextResponse.json({
      message: 'Projects fetched successfully',
      statusCode: 200,
      success: true,
      data: projects,
      metadata: { count: projects.length },
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching projects:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json({
        message: error.message,
        statusCode: error.statusCode,
        success: false,
        data: null
      }, { status: error.statusCode });
    }
    
    return NextResponse.json({
      message: 'Internal server error',
      statusCode: 500,
      success: false,
      data: null
    }, { status: 500 });
  }
}

// POST /api/projects - Create new project
export async function POST(request) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    const authResult = verifyAuthToken(authHeader);
    
    if (!authResult.success) {
      return NextResponse.json({
        message: authResult.error,
        statusCode: 401,
        success: false,
        data: null,
        errors: [{ field: 'authorization', message: authResult.error }],
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }
    
    const requestBody = await request.json();
    
    // Validate request data using Zod schema
    const validation = await validateData(projectCreationSchema, requestBody);
    if (!validation.success) {
      const errorResponse = createValidationErrorResponse(
        validation.errors,
        validation.message
      );
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    const { projectSlug, name, description, settings } = validation.data;
    
    // Check if project slug already exists for this user
    const existingProject = await Project.findOne({ 
      projectSlug, 
      userId: authResult.user.userId 
    });
    if (existingProject) {
      return NextResponse.json({
        message: 'Project with this slug already exists',
        statusCode: 409,
        success: false,
        data: null,
        errors: [{ field: 'projectSlug', message: 'A project with this slug already exists in your account' }],
        timestamp: new Date().toISOString()
      }, { status: 409 });
    }
    
    // Create root folder for the project
    const rootFolder = new File({
      projectId: null, // Will be set after project is created
      parentId: null,
      name: 'root',
      type: 'folder'
    });
    
    const savedRootFolder = await rootFolder.save();
    
    // Create new project
    const newProject = new Project({
      projectSlug,
      userId: authResult.user.userId,
      name,
      description,
      rootFolderId: savedRootFolder._id,
      settings
    });
    
    const savedProject = await newProject.save();
    
    // Update root folder's projectId
    savedRootFolder.projectId = savedProject._id;
    await savedRootFolder.save();
    
    return NextResponse.json({
      message: 'Project created successfully',
      statusCode: 201,
      success: true,
      data: savedProject,
      timestamp: new Date().toISOString()
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error in projects API:', error);
    
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