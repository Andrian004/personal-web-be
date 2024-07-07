import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer") &&
    req.signedCookies.jwtk
  ) {
    try {
      const headerToken = req.headers.authorization.split(" ")[1];
      const cookieToken = req.signedCookies.jwtk;

      if (headerToken !== cookieToken) {
        res.statusCode = 401;
        throw new Error("Unauthorized");
      }

      const verified = jwt.verify(
        cookieToken,
        process.env.SECRET_KEY as string
      );

      if (!verified) {
        res.statusCode = 401;
        throw new Error("Unauthorized");
      }

      next();
    } catch (err) {
      next(err);
    }
  } else {
    return res.status(403).json({ message: "Forbidden!", stack: ":(" });
  }
};
