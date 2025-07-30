import { NextFunction, Request, Response } from "express";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Project } from "../models/project-model";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "jsonwebtoken";
import { UpdateWriteOpResult } from "mongoose";
import { DefaultResponse } from "../interfaces/default-response";

// GET ALL PROJECT
export const getAllProjects = async (
  req: Request,
  res: Response<DefaultResponse>,
  next: NextFunction
) => {
  const { page, limit, search = "" } = req.query;
  let liked: boolean = false;
  let decodedToken: JwtPayload;

  // Parsing query parameters
  const searchRegex = new RegExp(search.toString(), "gi");
  const parsedPage = parseInt(page as string, 10) || 1;
  const parsedLimit = parseInt(limit as string, 10) || 6;

  // Get token from cookie and decode it
  const token: string = await req.signedCookies.jwtk;
  if (token) {
    decodedToken = jwtDecode<JwtPayload>(token);
  }

  try {
    const projects = await Project.find({ title: { $regex: searchRegex } })
      .limit(parsedLimit)
      .skip((parsedPage - 1) * parsedLimit)
      .exec();

    if (projects.length === 0) {
      res.statusCode = 404;
      throw new Error("Project not found");
    }

    const count = await Project.countDocuments();
    const totalPages = Math.ceil(count / parsedLimit);

    const outputProjects = projects.map((project) => {
      if (token) {
        // Use token to check whether the user has liked the project
        liked = project.likes.includes(decodedToken.userId);
      }

      return {
        id: project._id,
        title: project.title,
        github: project.github,
        url: project.url,
        image: project.image,
        description: project.description.slice(0, 60),
        totalLikes: project.likes.length,
        totalComments: project.comments.length,
        liked,
      };
    });

    res.status(200).json({
      message: "OK",
      body: outputProjects,
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

// GET A PROJECT BY ID
export const getProjectById = async (
  req: Request,
  res: Response<DefaultResponse>,
  next: NextFunction
) => {
  let liked: boolean = false;
  let decodedToken: JwtPayload | undefined;

  // Get token from cookie and decode it
  const token: string = await req.signedCookies.jwtk;
  if (token) {
    decodedToken = jwtDecode<JwtPayload>(token);
  }

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.statusCode = 404;
      throw new Error("Project not found");
    }

    if (token && decodedToken) {
      // Use token to check whether the user has liked the project
      liked = project.likes.includes(decodedToken.userId);
    }

    res.status(200).json({
      message: "OK",
      body: {
        title: project.title,
        description: project.description,
        github: project.github,
        url: project.url,
        image: project.image,
        videoId: project.videoId,
        totalLikes: project.likes.length,
        totalComments: project.comments.length,
        liked,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ADD A PROJECT
export const addProject = async (
  req: Request,
  res: Response<DefaultResponse>,
  next: NextFunction
) => {
  const fileData = req.file;
  const { title, description, github, url, videoId } = req.body;

  try {
    if (!fileData) {
      res.statusCode = 400;
      throw new Error("Please upload an image");
    }

    // store image to cloudinary
    const uploadResult: UploadApiResponse = await new Promise((resolve) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image", folder: "projects" },
          (error, uploadResult) => {
            if (error) throw new Error(error.message);
            if (!uploadResult) throw new Error("Img url is undefined");
            return resolve(uploadResult);
          }
        )
        .end(fileData.buffer);
    });

    const newProject = new Project({
      title,
      description,
      github,
      url,
      videoId,
      image: {
        public_id: uploadResult.public_id,
        imgUrl: uploadResult.secure_url,
      },
    });

    await newProject.save();

    res.status(200).json({ message: "Add project!" });
  } catch (error) {
    next(error);
  }
};

// DELETE A PROJECT BY ID
export const deleteProjectById = async (
  req: Request,
  res: Response<DefaultResponse>,
  next: NextFunction
) => {
  const projectId = req.params.id;

  try {
    // Remove project in database by id
    const deletedProject = await Project.findByIdAndDelete(projectId);

    if (!deletedProject || !deletedProject.image) {
      res.statusCode = 404;
      throw new Error("Project not found");
    }

    // Remove image in cloudinary by img public_id
    await cloudinary.uploader.destroy(deletedProject.image.public_id);

    res.status(200).json({ message: "Deleted project successfull" });
  } catch (error) {
    next(error);
  }
};

// UPDATE A PROJECT BY ID
export const updateProjectById = async (
  req: Request,
  res: Response<DefaultResponse<UpdateWriteOpResult>>,
  next: NextFunction
) => {
  const { title, description, url, github, videoId } = req.body;

  try {
    const response = await Project.updateOne(
      { _id: req.params.id },
      { title, description, url, github, videoId }
    );
    res
      .status(200)
      .json({ message: "Project successfully updated", body: response });
  } catch (error) {
    next(error);
  }
};
