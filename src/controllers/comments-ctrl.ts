import { NextFunction, Request, Response } from "express";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "jsonwebtoken";
import { AddCommentBody, ReplyCommentBody } from "../types/comment-types";
import { Comment } from "../models/comment-model";
import { Project } from "../models/project-model";

// GET COMMENTS BY PROJECT ID
export const getCommentsByProjectId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pid = req.params.pid;
  const { page, limit } = req.query; // Pagination
  let liked: boolean = false;
  let decodedToken: JwtPayload | undefined;

  // Parsing query parameters
  const parsedPage = parseInt(page as string, 10) || 1;
  const parsedLimit = parseInt(limit as string, 10) || 10;

  // Get token from cookie and decode it
  const token: string = await req.cookies.token;
  if (token) {
    decodedToken = jwtDecode<JwtPayload>(token);
  }

  try {
    const comments = await Comment.find({
      $and: [{ projectId: pid }, { isReply: false }],
    })
      .populate("sender", "username role avatar.imgUrl -_id")
      .limit(parsedLimit)
      .skip((parsedPage - 1) * parsedLimit)
      .exec();

    if (comments.length === 0) {
      return res.status(404).json({ message: "No comments found" });
    }

    const count = await Comment.countDocuments({
      $and: [{ projectId: pid }, { isReply: false }],
    });
    const totalPages = Math.ceil(count / parsedLimit);

    const response = comments.map((comment) => {
      if (token && decodedToken) {
        // Use token to check whether the user has liked the comment
        liked = comment.likes.includes(decodedToken.userId);
      }

      return {
        _id: comment._id,
        projectId: comment.projectId,
        message: comment.message,
        sender: comment.sender,
        isReply: comment.isReply,
        hasReply: comment.hasReply,
        totalLikes: comment.likes.length,
        totalDislikes: comment.dislikes.length,
        liked,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };
    });

    res.status(200).json({
      message: "OK",
      body: response,
      pagination: {
        totalPage: totalPages,
        currentPage: parsedPage,
        hasNextPage: parsedPage < totalPages ? true : false,
        hasPrevPage: parsedPage > 1 ? true : false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET REPLY COMMENTS
export const getRepliesComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const projectId = req.params.pid;
  const groupId = req.params.gid;
  const { page, limit } = req.query; // Pagination
  let liked: boolean = false;
  let decodedToken: JwtPayload | undefined;

  // Parsing query parameters
  const parsedPage = parseInt(page as string, 10) || 1;
  const parsedLimit = parseInt(limit as string, 10) || 10;

  // Get token from cookie and decode it
  const token: string = await req.cookies.token;
  if (token) {
    decodedToken = jwtDecode<JwtPayload>(token);
  }

  try {
    const replies = await Comment.find({
      $and: [{ projectId: projectId }, { replyGroup: groupId }],
    })
      .populate("sender", "username role avatar.imgUrl -_id")
      .limit(parsedLimit)
      .skip((parsedPage - 1) * parsedLimit)
      .exec();

    const count = await Comment.countDocuments({
      $and: [{ projectId: projectId }, { replyGroup: groupId }],
    });
    const totalPages = Math.ceil(count / parsedLimit);

    const response = replies.map((reply) => {
      if (token && decodedToken) {
        // Use token to check whether the user has liked the comment
        liked = reply.likes.includes(decodedToken.userId);
      }

      return {
        _id: reply._id,
        projectId: reply.projectId,
        message: reply.message,
        sender: reply.sender,
        isReply: reply.isReply,
        totalLikes: reply.likes.length,
        totalDislikes: reply.dislikes.length,
        replyGroup: reply.replyGroup,
        liked,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
      };
    });

    res.status(200).json({
      message: "Success",
      body: response,
      pagination: {
        totalPage: totalPages,
        currentPage: parsedPage,
        hasNextPage: parsedPage < totalPages ? true : false,
        hasPrevPage: parsedPage > 1 ? true : false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ADD MAIN COMMENTS TO A PROJECT
export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body: AddCommentBody = req.body;

  try {
    const validProject = await Project.findById(body.projectId);
    if (!validProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newCommentData = new Comment({
      projectId: body.projectId,
      sender: body.uuid,
      message: body.message,
    });

    const commentsData = await newCommentData.save();
    await Project.updateOne(
      { _id: body.projectId },
      { $push: { comments: commentsData._id } }
    );
    res.status(200).json({ message: "Successfully added" });
  } catch (error) {
    next(error);
  }
};

// REPLY A COMMENT
export const replyComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body: ReplyCommentBody = req.body;

  try {
    const newCommentData = new Comment({
      projectId: body.projectId,
      sender: body.uuid,
      message: body.message,
      replyGroup: body.groupId,
      isReply: true,
    });

    const commentsData = await newCommentData.save();
    await Comment.findByIdAndUpdate(body.groupId, { hasReply: true });
    await Project.updateOne(
      { _id: body.projectId },
      { $push: { comments: commentsData._id } }
    );
    res.status(200).json({
      message: "Successfully added",
      body: {
        _id: commentsData._id,
        projectId: commentsData.projectId,
        message: commentsData.message,
        sender: commentsData.sender,
        isReply: commentsData.isReply,
        totalLikes: commentsData.likes.length,
        totalDislikes: commentsData.dislikes.length,
        replyGroup: commentsData.replyGroup,
        createdAt: commentsData.createdAt,
        updatedAt: commentsData.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE A COMMENTS
export const deleteComment = (req: Request, res: Response) => {
  // const pid = req.params.pid;
  // const cid = req.params.cid;

  res.status(200).json({
    message: "Successfully deleted",
  });
};
