import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";

export const verifyAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwtDecode<JwtPayload>(token);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden!" });
    }

    next();
  } else {
    res.status(403).json({ message: "Forbidden!" });
  }
};
