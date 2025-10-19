import { NextResponse } from 'next/server';
import connectDB from '@server/db/connect';
import File from '@server/models/File';
import Project from '@server/models/Project';
import { AppError, BadRequestError, UnauthorizedError, NotFoundError } from '@server/utils/appError';
import { verifyAuthToken } from '@server/utils/auth';
import { config } from '@server/config';
import { fileCreationSchema } from '@server/validations/fileValidation';
import { validateData, createValidationErrorResponse } from '@server/validations';

// POST /api/files - Create new file or folder
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
    const validation = await validateData(fileCreationSchema, requestBody);
    if (!validation.success) {
      const errorResponse = createValidationErrorResponse(
        validation.errors,
        validation.message
      );
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    const { projectId, parentId, name, type, content } = validation.data;
    
    // Verify user owns the project
    const project = await Project.findOne({ 
      _id: projectId, 
      userId: authResult.user.userId 
    });
    
    if (!project) {
      return NextResponse.json({
        message: 'Project not found or access denied',
        statusCode: 404,
        success: false,
        data: null,
        errors: [{ field: 'projectId', message: 'Project not found or you do not have access to it' }],
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }
    
    // If parentId is provided, verify it exists and belongs to the same project
    if (parentId) {
      const parentFile = await File.findOne({ 
        _id: parentId, 
        projectId: projectId,
        type: 'folder' 
      });
      
      if (!parentFile) {
        return NextResponse.json({
          message: 'Parent folder not found',
          statusCode: 404,
          success: false,
          data: null,
          errors: [{ field: 'parentId', message: 'Parent folder does not exist or is not a folder' }],
          timestamp: new Date().toISOString()
        }, { status: 404 });
      }
    }
    
    // Check if file/folder with same name already exists in the same directory
    const existingFile = await File.findOne({
      projectId,
      parentId: parentId || null,
      name
    });
    
    if (existingFile) {
      return NextResponse.json({
        message: 'File or folder with this name already exists',
        statusCode: 409,
        success: false,
        data: null,
        errors: [{ field: 'name', message: 'A file or folder with this name already exists in this location' }],
        timestamp: new Date().toISOString()
      }, { status: 409 });
    }
    
    // Create new file
    const newFile = new File({
      projectId,
      parentId: parentId || null,
      name,
      type,
      ...(content && { content })
    });
    
    const savedFile = await newFile.save();
    
    return NextResponse.json({
      message: `${type === 'folder' ? 'Folder' : 'File'} created successfully`,
      statusCode: 201,
      success: true,
      data: savedFile,
      timestamp: new Date().toISOString()
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating file:', error);
    
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
      errors: [{ field: 'server', message: 'An unexpected error occurred while creating the file' }],
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}