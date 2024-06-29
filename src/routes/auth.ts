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
} from "../controllers/auth-ctrl";

authRouters.post("/login", loginFunction);
authRouters.post("/signup", signupFunction);
authRouters.patch("/changePassword/:uid", verifyToken, changePassword);
authRouters.delete("/logout", verifyToken, logout);
authRouters.delete("/:uid", verifyToken, deleteAccountFunction);

export { authRouters };
