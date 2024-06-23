import { NextFunction, Request, Response } from "express";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import validator from "validator";
import { User } from "../models/user-model";

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.uid;
  const { username } = req.body;

  // validate username
  if (
    !validator.isAlphanumeric(username, "en-US", { ignore: " _" }) ||
    !validator.isLength(username, { min: 3, max: 25 })
  ) {
    return res.status(400).json({ message: "Invalid username!" });
  }

  try {
    const updateResponse = await User.updateOne(
      { _id: userId },
      { username: username }
    );

    res.status(200).json({ message: "User updated!", body: updateResponse });
  } catch (error) {
    next(error);
  }
};

export const updatePicture = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.uid;
  const fileData = req.file;

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

    const response = await User.updateOne(
      { _id: userId },
      {
        avatar: {
          public_id: uploadResult.public_id,
          imageUrl: uploadResult.secure_url,
        },
      }
    );

    res.status(200).json({
      message: "Profile picture successfully updated",
      body: response,
    });
  } catch (error) {
    next(error);
  }
};
