import express from 'express';
import {
  getUserProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getPublicProjects,
} from '../controllers/project.controller.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.mid.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/public', getPublicProjects);
router.get('/:id', optionalAuthenticate, getProjectById);

// Protected routes
router.use(authenticate);

router.get('/', getUserProjects);

router.post('/', createProject);

// Support both PATCH and PUT for updates
router.patch('/:id', updateProject);
router.put('/:id', updateProject);

router.delete('/:id', deleteProject);

export default router;
