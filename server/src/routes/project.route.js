import express from "express";
import {
  getUserProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";
import { authenticate } from "../middlewares/auth.mid.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getUserProjects);

router.get("/:id", getProjectById);

router.post("/", createProject);

// Support both PATCH and PUT for updates
router.patch("/:id", updateProject);
router.put("/:id", updateProject);

router.delete("/:id", deleteProject);

export default router;
