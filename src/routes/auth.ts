import express from "express";
const authRouters = express.Router();

// Import Middleware
import { verifyToken } from "../middlewares/verify-token";

// Import controllers
import {
  loginFunction,
  signupFunction,
  deleteAccountFunction,
  logout,
  changePassword,
  refreshToken,
} from "../controllers/auth-ctrl";

authRouters.post("/login", loginFunction);
authRouters.post("/signup", signupFunction);
authRouters.post("/refresh", refreshToken);
authRouters.patch("/changePassword/:uid", verifyToken, changePassword);
authRouters.delete("/logout", logout);
authRouters.delete("/:uid", verifyToken, deleteAccountFunction);

export { authRouters };
