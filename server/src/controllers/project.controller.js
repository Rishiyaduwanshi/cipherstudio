import Project from '../models/project.model.js';
import appResponse from '../utils/appResponse.js';
import { AppError, NotFoundError } from '../utils/appError.js';

export const getPublicProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ visibility: 'public' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    appResponse(res, {
      statusCode: 200,
      message: 'Public projects fetched successfully',
      data: { projects },
    });
  } catch (err) {
    next(err);
  }
};

export const getUserProjects = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({ userId });

    appResponse(res, {
      statusCode: 200,
      message: 'Projects fetched successfully',
      data: { projects },
    });
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('userId', 'name email');
    if (!project) throw new NotFoundError('Project not found');

    // Allow access if project is public OR user is the owner
    const isPublic = project.visibility === 'public';
    const isOwner = req.user && project.userId._id.toString() === req.user._id.toString();
    
    if (!isPublic && !isOwner) {
      throw new AppError({ statusCode: 403, message: 'Forbidden' });
    }

    appResponse(res, {
      statusCode: 200,
      message: 'Project fetched successfully',
      data: { project },
    });
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req, res, next) => {
  try {
    
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new AppError({ 
        statusCode: 400, 
        message: 'Request body is empty. Ensure you\'re sending JSON with Content-Type: application/json' 
      });
    }

    const userId = req.user._id;
    let { name, files = {}, description = '', visibility = 'private', settings = {} } = req.body;


    if (!name) {
      throw new AppError({
        statusCode: 400,
        message: 'Project name is required'
      });
    }

    const projectData = {
      name,
      userId,
      files,
      description,
      visibility,
      settings: {
        framework: settings.framework || 'react',
        autoSave: settings.autoSave ?? true
      }
    };

    const project = await Project.create(projectData);

    appResponse(res, {
      statusCode: 201,
      message: 'Project created successfully',
      data: { project },
    });
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) throw new NotFoundError('Project not found');

    if (project.userId.toString() !== req.user._id)
      throw new AppError({ statusCode: 403, message: 'Forbidden' });

    const { name, files, description, visibility, settings } = req.body;
    if (name !== undefined) project.name = name;
    if (files !== undefined) project.files = files;
    if (description !== undefined) project.description = description;
    if (visibility !== undefined) project.visibility = visibility;
    if (settings !== undefined) project.settings = settings;

    await project.save();

    appResponse(res, {
      statusCode: 200,
      message: 'Project updated successfully',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) throw new NotFoundError('Project not found');

    if (project.userId.toString() !== req.user._id.toString())
      throw new AppError({ statusCode: 403, message: 'Forbidden' });

    await project.deleteOne();

    appResponse(res, {
      statusCode: 200,
      message: 'Project deleted successfully',
      data: [],
    });
  } catch (err) {
    next(err);
  }
};
