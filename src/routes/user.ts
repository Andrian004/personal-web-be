import express from "express";
const userRouters = express.Router();

// Import middleware
import { verifyToken } from "../middlewares/verify-token";

// Import controllers
import { updatePicture } from "../controllers/user-ctrl";

userRouters.patch("/picture/:uid", verifyToken, updatePicture);

export { userRouters };
