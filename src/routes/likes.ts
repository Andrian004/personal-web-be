import express from "express";
const likeRouters = express.Router();

// Import Middleware
import { verifyToken } from "../middlewares/verify-token";
import { verifyAdmin } from "../middlewares/verify-admin";

// Import controllers
import {
  addLike,
  getAllLikes,
  removeLike,
  addCommentLike,
  removeCommentLike,
} from "../controllers/likes-ctrl";

// Project like
likeRouters.post("/", verifyToken, addLike);
likeRouters.delete("/", verifyToken, removeLike);
likeRouters.get("/:pid", verifyToken, verifyAdmin, getAllLikes);

// Comment like
likeRouters.post("/comment", verifyToken, addCommentLike);
likeRouters.delete("/comment", verifyToken, removeCommentLike);
// likeRouters.get("/comment/:cid", verifyToken, verifyAdmin, getCommentLikes)

export { likeRouters };
