import { NextFunction, Request, Response } from "express";
import { Project } from "../models/project-model";
import { Comment } from "../models/comment-model";

// ADD LIKE
export const addLike = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { pid, uid } = req.body;

  try {
    const response = await Project.updateOne(
      { _id: pid },
      { $addToSet: { likes: uid } }
    );

    res.status(200).json({ message: "liked", body: response });
  } catch (error) {
    next(error);
  }
};

// UNLIKE
export const removeLike = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { pid, uid } = req.query;

  try {
    const response = await Project.updateOne(
      { _id: pid },
      { $pull: { likes: uid } }
    );

    res.status(200).json({ message: "unliked", body: response });
  } catch (error) {
    next(error);
  }
};

// GET ALL LIKES (DETAILED)
export const getAllLikes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pid = req.params.pid;

  try {
    const response = await Project.findById(pid);

    if (!response) {
      return res.status(404).json({ message: "Not Found" });
    }

    const populatedLikes = await response.populate(
      "likes",
      "_id username email"
    );

    res.status(200).json({ message: "OK", body: populatedLikes.likes });
  } catch (error) {
    next(error);
  }
};

// ADD COMMENT LIKE
export const addCommentLike = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { cid, uid } = req.body; // get commentId & userId

  try {
    const response = await Comment.updateOne(
      { _id: cid },
      { $addToSet: { likes: uid } }
    );

    res.status(200).json({ message: "liked", body: response });
  } catch (error) {
    next(error);
  }
};

// UNLIKE COMMENT
export const removeCommentLike = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { cid, uid } = req.query; // get commentId & userId

  try {
    const response = await Comment.updateOne(
      { _id: cid },
      { $pull: { likes: uid } }
    );

    res.status(200).json({ message: "unliked", body: response });
  } catch (error) {
    next(error);
  }
};
