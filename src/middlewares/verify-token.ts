import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const verified = jwt.verify(token, process.env.SECRET_KEY as string);

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
