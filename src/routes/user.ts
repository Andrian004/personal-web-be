import express from "express";
const userRouters = express.Router();

// Import middleware
import { verifyToken } from "../middlewares/verify-token";

// Import controllers
import { updatePicture } from "../controllers/user-ctrl";
import { upload } from "../configs/app-config";

userRouters.patch(
  "/picture/:uid",
  verifyToken,
  upload.single("image"),
  updatePicture
);

export { userRouters };
