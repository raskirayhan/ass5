import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { ApiError } from "../utils/ApiError";
import prisma from "../prisma";
import { AuthPayload } from "../interfaces";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, status: true },
    });

    if (!user) {
      throw ApiError.unauthorized("User not found");
    }

    if (user.status === "BANNED") {
      throw ApiError.forbidden("Account has been banned");
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(ApiError.unauthorized("Invalid or expired token"));
  }
};
