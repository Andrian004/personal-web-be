import { NextFunction, Request, Response } from "express";
import validator from "validator";
import bcrypt from "bcryptjs";
import { User } from "../models/user-model";
import { createJwt } from "../libs/create-jwt";

// SIGN UP ====================================================================
export const signupFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password } = req.body;

  // validate username
  if (
    !validator.isAlphanumeric(username, "en-US", { ignore: " _" }) ||
    !validator.isLength(username, { min: 3, max: 25 })
  ) {
    return res.status(400).json({ message: "Invalid username!" });
  }

  // validate email
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email!" });
  }

  // check email is already exists
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    return res.status(400).json({ message: "User already exists" });
  }

  // validate password
  if (!validator.isLength(password, { min: 6 })) {
    return res.status(400).json({
      message: "Password must be at least 6 characters!",
    });
  }

  // hashing pasword
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  if (!hashPassword) {
    return res.status(500).json({ message: "Server error!" });
  }

  // create new user
  const newUser = new User({
    username,
    email,
    password: hashPassword,
  });

  try {
    // save new user to database
    const user = await newUser.save();

    // create jwt token
    const token = createJwt({
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // response after user successfully created
    res.status(200).json({ message: "Sign up successfully", token });
  } catch (error) {
    next(error);
  }
};

// SIGN IN ====================================================================
export const loginFunction = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // validate username
  if (
    !validator.isAlphanumeric(username) ||
    !validator.isLength(username, { min: 3, max: 25 })
  ) {
    return res.status(400).json({ message: "Invalid username!" });
  }

  // validate password
  if (!validator.isLength(password, { min: 6 })) {
    return res.status(400).json({
      message: "Password must be at least 6 characters!",
    });
  }

  // find user by username
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "User not found!" });
  }

  // compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid password!" });
  }

  // create token with jsonwebtoken(JWT)
  const authToken = createJwt({
    userId: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
  });

  // send token to user
  res.status(200).json({ message: "Login successfullly", token: authToken });
};

// DELETE ACCOUNT
export const deleteAccountFunction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.uuid;

  try {
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "Account deleted!" });
  } catch (error) {
    next(error);
  }
};
