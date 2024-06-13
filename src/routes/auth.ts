import express from "express";
const authRouters = express.Router();

// Import controllers
import {
  loginFunction,
  signupFunction,
  deleteAccountFunction,
} from "../controllers/auth-ctrl";

authRouters.post("/login", loginFunction);
authRouters.post("/signup", signupFunction);
authRouters.delete("/:uuid", deleteAccountFunction);

export { authRouters };
