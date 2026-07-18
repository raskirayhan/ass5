import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

export const authorize = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden("You do not have permission to access this resource")
      );
    }

    next();
  };
};
