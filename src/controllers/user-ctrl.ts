import { NextFunction, Request, Response } from "express";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import validator from "validator";
import { User } from "../models/user-model";
import { DefaultResponse } from "../interfaces/default-response";
import { Document, UpdateWriteOpResult } from "mongoose";

// GET USER BY ID
export const getUserById = async (
  req: Request,
  res: Response<DefaultResponse<Document<unknown>>>,
  next: NextFunction
) => {
  const userId = req.params.uid;

  try {
    const userdata = await User.findById(userId).select(
      "_id email username avatar role"
    );

    if (!userdata) {
      res.statusCode = 404;
      throw new Error("User not found!");
    }

    res.status(200).json({ message: "user found", body: userdata });
  } catch (error) {
    next(error);
  }
};

// UPDATE USER
export const updateUser = async (
  req: Request,
  res: Response<DefaultResponse<UpdateWriteOpResult>>,
  next: NextFunction
) => {
  const userId = req.params.uid;
  const { username } = req.body;

  try {
    // validate username
    if (
      !validator.isAlphanumeric(username, "en-US", { ignore: " _" }) ||
      !validator.isLength(username, { min: 3, max: 25 })
    ) {
      res.statusCode = 400;
      throw new Error("Invalid username!");
    }

    const updateResponse = await User.updateOne(
      { _id: userId },
      { username: username }
    );

    res.status(200).json({ message: "User updated!", body: updateResponse });
  } catch (error) {
    next(error);
  }
};

// UPDATE USER PICTURE
export const updatePicture = async (
  req: Request,
  res: Response<DefaultResponse<UpdateWriteOpResult>>,
  next: NextFunction
) => {
  const userId = req.params.uid;
  const fileData = req.file;

  try {
    if (!fileData) {
      res.statusCode = 400;
      throw new Error("Please upload an image");
    }

    const user = await User.findById(userId);
    if (!user) {
      res.statusCode = 404;
      throw new Error("User not found!");
    }

    if (user.avatar?.public_id) {
      // delete image from cloudinary
      await cloudinary.uploader.destroy(user.avatar.public_id);
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

    const response = await User.updateOne(
      { _id: userId },
      {
        $set: {
          "avatar.public_id": uploadResult.public_id,
          "avatar.imgUrl": uploadResult.secure_url,
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
