import express from "express";
const commentRouters = express.Router();

import {
  addComment,
  deleteComment,
  getRepliesComment,
  getCommentsByProjectId,
  replyComment,
} from "../controllers/comments-ctrl";
import { verifyToken } from "../middlewares/verify-token";

commentRouters.get("/:pid", getCommentsByProjectId);
commentRouters.get("/:pid/:gid", getRepliesComment);
commentRouters.post("/", verifyToken, addComment);
commentRouters.post("/reply", verifyToken, replyComment);
commentRouters.delete("/:pid/:cid", verifyToken, deleteComment);

export { commentRouters };
