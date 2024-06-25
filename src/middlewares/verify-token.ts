import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let headerToken: string;
  let cookieToken: string; // server only

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer") &&
    req.signedCookies.jwtk
  ) {
    try {
      headerToken = req.headers.authorization.split(" ")[1];
      cookieToken = req.signedCookies.jwtk;

      if (headerToken !== cookieToken) {
        return res.status(401).json({ message: "Unauthorized!" });
      }

      const verified = jwt.verify(
        cookieToken,
        process.env.SECRET_KEY as string
      );

      if (!verified) {
        return res.status(401).json({ message: "Unauthorized!" });
      }

      next();
    } catch (err) {
      res.status(401).json({ message: "Unauthorized!" });
    }
  } else {
    res.status(403).json({ message: "Forbidden!" });
  }
};
