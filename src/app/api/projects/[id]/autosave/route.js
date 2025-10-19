import connectDB from '@/server/db/connect';
import Project from '@/server/models/Project';
import { NextResponse } from 'next/server';

// POST /api/projects/[id]/autosave - Auto-save project files
export async function POST(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await request.json();
    const { files, owner, lastModified } = body;

    const project = await Project.findById(id);
    
    if (!project) {
      return NextResponse.json({
        success: false,
        error: 'Project not found'
      }, { status: 404 });
    }

    // Check ownership
    if (project.owner !== owner) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    // Update only the files
    if (files) {
      const filesMap = new Map();
      
      Object.entries(files).forEach(([path, fileData]) => {
        filesMap.set(path, {
          code: fileData.code || fileData.content || fileData,
          language: fileData.language,
          lastModified: new Date()
        });
      });
      
      project.files = filesMap;
    }

    // Update last accessed time
    project.lastAccessed = new Date();
    
    const updatedProject = await project.save();

    return NextResponse.json({
      success: true,
      data: {
        id: updatedProject._id,
        lastModified: updatedProject.updatedAt,
        fileCount: updatedProject.fileCount,
        totalSize: updatedProject.totalSize
      },
      message: 'Auto-saved successfully'
    });

  } catch (error) {
    console.error('POST /api/projects/[id]/autosave error:', error);
    return NextResponse.json({
      success: false,
      error: 'Auto-save failed',
      message: error.message
    }, { status: 500 });
  }
}