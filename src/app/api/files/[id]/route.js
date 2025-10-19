import { NextResponse } from 'next/server';
import connectDB from '@server/db/connect';
import File from '@server/models/File';
import Project from '@server/models/Project';
import { AppError, BadRequestError, UnauthorizedError, NotFoundError } from '@server/utils/appError';
import { verifyAuthToken } from '@server/utils/auth';
import { config } from '@server/config';

// GET /api/files/[id] - Get specific file
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    const authResult = verifyAuthToken(authHeader);
    
    if (!authResult.success) {
      throw new UnauthorizedError(authResult.error);
    }
    
    const { id } = params;
    
    const file = await File.findById(id).populate('projectId');
    
    if (!file) {
      throw new NotFoundError('File not found');
    }
    
    // Verify user owns the project
    if (file.projectId.userId.toString() !== authResult.user.userId) {
      throw new UnauthorizedError('Access denied');
    }
    
    return NextResponse.json({
      message: 'File fetched successfully',
      statusCode: 200,
      success: true,
      data: file
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching file:', error);
    
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

// PUT /api/files/[id] - Update file
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    const authResult = verifyAuthToken(authHeader);
    
    if (!authResult.success) {
      throw new UnauthorizedError(authResult.error);
    }
    
    const { id } = params;
    const { name, parentId } = await request.json();
    
    const file = await File.findById(id).populate('projectId');
    
    if (!file) {
      throw new NotFoundError('File not found');
    }
    
    // Verify user owns the project
    if (file.projectId.userId.toString() !== authResult.user.userId) {
      throw new UnauthorizedError('Access denied');
    }
    
    // If renaming, check for conflicts
    if (name && name !== file.name) {
      const existingFile = await File.findOne({
        projectId: file.projectId._id,
        parentId: file.parentId,
        name
      });
      
      if (existingFile) {
        return NextResponse.json({
          message: 'File or folder with this name already exists',
          statusCode: 409,
          success: false,
          data: null
        }, { status: 409 });
      }
      
      file.name = name;
    }
    
    // If moving, verify new parent exists and is a folder
    if (parentId !== undefined) {
      if (parentId) {
        const newParent = await File.findOne({
          _id: parentId,
          projectId: file.projectId._id,
          type: 'folder'
        });
        
        if (!newParent) {
          throw new NotFoundError('Target parent folder not found');
        }
        
        // Check for conflicts in new location
        const existingFile = await File.findOne({
          projectId: file.projectId._id,
          parentId: parentId,
          name: file.name
        });
        
        if (existingFile) {
          return NextResponse.json({
            message: 'File or folder with this name already exists in target location',
            statusCode: 409,
            success: false,
            data: null
          }, { status: 409 });
        }
      }
      
      file.parentId = parentId || null;
    }
    
    const updatedFile = await file.save();
    
    return NextResponse.json({
      message: 'File updated successfully',
      statusCode: 200,
      success: true,
      data: updatedFile
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error updating file:', error);
    
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

// DELETE /api/files/[id] - Delete file
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    const authResult = verifyAuthToken(authHeader);
    
    if (!authResult.success) {
      throw new UnauthorizedError(authResult.error);
    }
    
    const { id } = params;
    
    const file = await File.findById(id).populate('projectId');
    
    if (!file) {
      throw new NotFoundError('File not found');
    }
    
    // Verify user owns the project
    if (file.projectId.userId.toString() !== authResult.user.userId) {
      throw new UnauthorizedError('Access denied');
    }
    
    // If it's a folder, delete all children recursively
    if (file.type === 'folder') {
      await deleteFileAndChildren(id);
    } else {
      await File.findByIdAndDelete(id);
    }
    
    return NextResponse.json({
      message: 'File deleted successfully',
      statusCode: 200,
      success: true,
      data: null
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error deleting file:', error);
    
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

// Helper function to recursively delete a folder and its children
async function deleteFileAndChildren(fileId) {
  const children = await File.find({ parentId: fileId });
  
  for (const child of children) {
    if (child.type === 'folder') {
      await deleteFileAndChildren(child._id);
    } else {
      await File.findByIdAndDelete(child._id);
    }
  }
  
  await File.findByIdAndDelete(fileId);
}