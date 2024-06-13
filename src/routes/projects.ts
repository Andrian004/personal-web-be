import express from "express";
import { upload } from "../configs/app-config";
import { verifyToken } from "../middlewares/verify-token";
import { verifyAdmin } from "../middlewares/verify-admin";
const projectRouters = express.Router();

// Import controllers
import {
  getAllProjects,
  getProjectById,
  addProject,
  deleteProjectById,
  updateProjectById,
} from "../controllers/pojects-ctrl";

projectRouters.get("/", getAllProjects);
projectRouters.get("/:id", getProjectById);
projectRouters.post(
  "/",
  verifyToken,
  verifyAdmin,
  upload.single("image"),
  addProject
);
projectRouters.delete("/:id", verifyToken, verifyAdmin, deleteProjectById);
projectRouters.patch("/:id", verifyToken, verifyAdmin, updateProjectById);

export { projectRouters };
