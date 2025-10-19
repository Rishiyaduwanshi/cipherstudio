import { NextResponse } from 'next/server';
import connectDB from '@server/db/connect';
import Project from '@server/models/Project';
import File from '@server/models/File';
import { AppError, BadRequestError, UnauthorizedError, NotFoundError } from '@server/utils/appError';
import { verifyAuthToken } from '@server/utils/auth';
import { config } from '@server/config';

// GET /api/projects/[id] - Get specific project
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    const authResult = verifyAuthToken(authHeader);
    
    if (!authResult.success) {
      throw new UnauthorizedError(authResult.error);
    }
    
    const { id } = params;
    
    const project = await Project.findOne({ 
      _id: id, 
      userId: authResult.user.userId 
    }).populate('rootFolderId');
    
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    
    return NextResponse.json({
      message: 'Project fetched successfully',
      statusCode: 200,
      success: true,
      data: project
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching project:', error);
    
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

// PUT /api/projects/[id] - Update project
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    const authResult = verifyAuthToken(authHeader);
    
    if (!authResult.success) {
      throw new UnauthorizedError(authResult.error);
    }
    
    const { id } = params;
    const { name, description, settings } = await request.json();
    
    // Find project and verify ownership
    const project = await Project.findOne({ 
      _id: id, 
      userId: authResult.user.userId 
    });
    
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    
    // Update project fields
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (settings) project.settings = { ...project.settings, ...settings };
    
    const updatedProject = await project.save();
    
    return NextResponse.json({
      message: 'Project updated successfully',
      statusCode: 200,
      success: true,
      data: updatedProject
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error updating project:', error);
    
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

// DELETE /api/projects/[id] - Delete project
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    const authResult = verifyAuthToken(authHeader);
    
    if (!authResult.success) {
      throw new UnauthorizedError(authResult.error);
    }
    
    const { id } = params;
    
    // Find project and verify ownership
    const project = await Project.findOne({ 
      _id: id, 
      userId: authResult.user.userId 
    });
    
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    
    // Delete all files associated with the project
    await File.deleteMany({ projectId: id });
    
    // Delete the project
    await Project.findByIdAndDelete(id);
    
    return NextResponse.json({
      message: 'Project deleted successfully',
      statusCode: 200,
      success: true,
      data: null
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error deleting project:', error);
    
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