import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import { User } from "../models/user-model";

export const verifyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.signedCookies.jwtk) {
    const token = req.signedCookies.jwtk;
    const decoded = jwtDecode<JwtPayload>(token);

    try {
      const user = await User.findById(decoded.id);

      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden!" });
      }

      next();
    } catch (err) {
      return res.status(403).json({ message: "Forbidden!" });
    }
  } else {
    res.status(403).json({ message: "Forbidden!" });
  }
};
