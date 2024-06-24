import express from "express";
const userRouters = express.Router();

// Import middleware
import { verifyToken } from "../middlewares/verify-token";
import { upload } from "../configs/app-config";

// Import controllers
import { updatePicture, updateUser } from "../controllers/user-ctrl";

userRouters.patch("/:uid", verifyToken, updateUser);
userRouters.patch(
  "/picture/:uid",
  verifyToken,
  upload.single("image"),
  updatePicture
);

export { userRouters };
