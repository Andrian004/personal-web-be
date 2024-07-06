import { NextFunction, Request, Response } from "express";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user-model";
import { createJwt } from "../libs/create-jwt";
import { AuthResponse } from "../interfaces/auth-response";

// SIGN UP
export const signupFunction = async (
  req: Request,
  res: Response<AuthResponse>,
  next: NextFunction
) => {
  const { username, email, password } = req.body;

  try {
    // validate username
    if (!validator.isAlphanumeric(username, "en-US", { ignore: " _" })) {
      res.statusCode = 400;
      throw new Error("Username must be alphanumeric!");
    }

    if (!validator.isLength(username, { min: 3, max: 25 })) {
      res.statusCode = 400;
      throw new Error(
        "Username must have at least 3 characters and max of 25 characters!"
      );
    }

    // validate email
    if (!validator.isEmail(email)) {
      res.statusCode = 400;
      throw new Error("Invalid email!");
    }

    // check email is already exists
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      res.statusCode = 400;
      throw new Error("User is already exists");
    }

    // validate password
    if (!validator.isLength(password, { min: 6 })) {
      res.statusCode = 400;
      throw new Error("Password must be at least 6 characters!");
    }

    // hashing pasword
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    if (!hashPassword) {
      throw new Error("Failed create a password!");
    }

    // create new user
    const newUser = new User({
      username,
      email,
      password: hashPassword,
    });

    // save new user to database
    const user = await newUser.save();

    // create token and refreshToken with jsonwebtoken(JWT)
    const accessToken = createJwt({ userId: user._id }, { expiresIn: "1d" });
    const refreshToken = createJwt({ userId: user._id }, { expiresIn: "90d" });

    // Store token to cookie
    res.cookie("jwtk", accessToken, {
      path: "/",
      expires: new Date(Date.now() + 3600000 * 24),
      httpOnly: true,
      signed: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
    });

    // response after user successfully created
    res.status(201).json({
      message: "Sign up successfully",
      token: accessToken,
      refreshToken: refreshToken,
      body: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// SIGN IN
export const loginFunction = async (
  req: Request,
  res: Response<AuthResponse>,
  next: NextFunction
) => {
  const { username, password } = req.body;
  try {
    // validate username
    if (
      !validator.isAlphanumeric(username, "en-US", { ignore: " _" }) ||
      !validator.isLength(username, { min: 3, max: 25 })
    ) {
      res.statusCode = 400;
      throw new Error("Invalid username!");
    }

    // validate password
    if (!validator.isLength(password, { min: 6 })) {
      res.statusCode = 400;
      throw new Error("Password must be at least 6 characters!");
    }

    // find user by username
    const user = await User.findOne({ username });
    if (!user) {
      res.statusCode = 400;
      throw new Error("Please sign up first!");
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.statusCode = 400;
      throw new Error("Invalid password!");
    }

    // create token and refreshToken with jsonwebtoken(JWT)
    const accessToken = createJwt({ userId: user._id }, { expiresIn: "1d" });
    const refreshToken = createJwt({ userId: user._id }, { expiresIn: "90d" });

    // Store token to cookie
    res.cookie("jwtk", accessToken, {
      path: "/",
      expires: new Date(Date.now() + 3600000 * 24),
      httpOnly: true,
      signed: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
    });

    // send token to user
    res.status(200).json({
      message: "Login successfullly",
      token: accessToken,
      refreshToken: refreshToken,
      body: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT
export const logout = async (req: Request, res: Response) => {
  res.clearCookie("jwtk", { path: "/" });
  res.status(200).json({ message: "Logout successfully" });
};

// REFRESH TOKEN
export const refreshToken = async (
  req: Request,
  res: Response<AuthResponse>,
  next: NextFunction
) => {
  const refreshToken = req.body.refreshToken;

  try {
    const token: string = await req.signedCookies.jwtk;

    if (!token) {
      res.statusCode = 401;
      throw new Error("Unauthorized!");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const verifiedRefreshToken: any = jwt.verify(
      refreshToken,
      process.env.SECRET_KEY as string
    );

    if (!verifiedRefreshToken) {
      res.statusCode = 401;
      throw new Error("Unauthorized!");
    }

    const userExist = await User.findById(verifiedRefreshToken.userId);

    if (!userExist) {
      res.statusCode = 404;
      throw new Error("User not found!");
    }

    const newAccessToken = createJwt(
      { userId: userExist._id },
      { expiresIn: "1d" }
    );

    res.cookie("jwtk", newAccessToken, {
      path: "/",
      expires: new Date(Date.now() + 3600000 * 24),
      httpOnly: true,
      signed: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
    });

    res.status(200).json({
      message: "Refresh successfullly",
      token: newAccessToken,
      body: {
        _id: userExist._id,
        username: userExist.username,
        email: userExist.email,
        avatar: userExist.avatar,
        role: userExist.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// CHANGE PASSWORD
export const changePassword = async (
  req: Request,
  res: Response<AuthResponse>,
  next: NextFunction
) => {
  const userId = req.params.uid;
  const { newPassword, oldPassword } = req.body;

  try {
    // validate new password
    if (newPassword === oldPassword) {
      res.statusCode = 400;
      throw new Error("New password must be different from old password!");
    }

    if (!validator.isLength(newPassword, { min: 6 })) {
      res.statusCode = 400;
      throw new Error("Password must be at least 6 characters!");
    }

    const user = await User.findById(userId, "password");
    if (!user) {
      res.statusCode = 404;
      throw new Error("User not found!");
    }

    // Compare oldPassword and password in database
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      res.statusCode = 400;
      throw new Error("Invalid password!");
    }

    // hashing pasword
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    if (!hashPassword) {
      throw new Error("Failed create a password!");
    }

    // Update password in database
    await User.findByIdAndUpdate(userId, { password: hashPassword });
    res.status(200).json({ message: "Password updated" });
  } catch (error) {
    // console.log(error);
    next(error);
  }
};

// DELETE ACCOUNT
export const deleteAccountFunction = async (
  req: Request,
  res: Response<AuthResponse>,
  next: NextFunction
) => {
  const userId = req.params.uid;

  try {
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "Account deleted!" });
  } catch (error) {
    next(error);
  }
};
