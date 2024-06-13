import { NextFunction, Request, Response } from "express";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Project } from "../models/project-model";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "jsonwebtoken";
import { QueryParams } from "../interfaces/query-params-interface";

// GET ALL PROJECT
export const getAllProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page = 1, limit = 6, search = "" }: QueryParams = req.query;
  const searchRegex = new RegExp(search, "gi");
  let liked: boolean = false;
  let decodedToken: JwtPayload;

  // Get token from cookie and decode it
  const token: string = await req.cookies.token;
  if (token) {
    decodedToken = jwtDecode<JwtPayload>(token);
  }

  try {
    const projects = await Project.find({ title: { $regex: searchRegex } })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    if (projects.length === 0) {
      return res.status(404).json({ message: "Projects not found" });
    }

    const count = await Project.countDocuments();
    const totalPages = Math.ceil(count / limit);

    const outputProjects = projects.map((project) => {
      if (token) {
        // Use token to check is user liked the project
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
        currentPage: page,
        hasNextPage: page < totalPages ? true : false,
        hasPrevPage: page > 1 ? true : false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET A PROJECT BY ID
export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let liked: boolean = false;
  let decodedToken: JwtPayload | undefined;

  // Get token from cookie and decode it
  const token: string = await req.cookies.token;
  if (token) {
    decodedToken = jwtDecode<JwtPayload>(token);
  }

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (token && decodedToken) {
      // Use token to check is user liked the project
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
  res: Response,
  next: NextFunction
) => {
  const fileData = req.file;
  const { title, description, github, url } = req.body;

  if (!fileData) {
    return res.status(400).json({ message: "Please upload an image" });
  }

  try {
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
  res: Response,
  next: NextFunction
) => {
  const projectId = req.params.id;

  try {
    // Remove project in database by id
    const deletedProject = await Project.findByIdAndDelete(projectId);

    if (!deletedProject || !deletedProject.image) {
      return res.status(404).json({ message: "Project not found!" });
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
  res: Response,
  next: NextFunction
) => {
  const { title, description, url, github } = req.body;

  try {
    const response = await Project.updateOne(
      { _id: req.params.id },
      { title, description, url, github }
    );
    res
      .status(200)
      .json({ message: "Project successfully updated", body: response });
  } catch (error) {
    next(error);
  }
};
