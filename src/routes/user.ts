import express from "express";
const userRouters = express.Router();

// Import middleware
import { verifyToken } from "../middlewares/verify-token";

// Import controllers
import { updatePicture, updateUser } from "../controllers/user-ctrl";
import { upload } from "../configs/app-config";

userRouters.patch("/:uid", verifyToken, updateUser);
userRouters.patch(
  "/picture/:uid",
  verifyToken,
  upload.single("image"),
  updatePicture
);

export { userRouters };
