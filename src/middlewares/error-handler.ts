import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../interfaces/error-response";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  let statusCode: number = 500;

  if (err.name === "TokenExpiredError") statusCode = 401;
  if (res.statusCode !== 200 && err.name !== "TokenExpiredError")
    statusCode = res.statusCode;

  res.status(statusCode).json({
    message: statusCode !== 500 ? err.message : "Server error",
    stack: process.env.NODE_ENV === "production" ? ":(" : err.stack,
  });
};
