import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map(
          (e: any) => `${e.path.join(".")}: ${e.message}`
        );
        return next(ApiError.badRequest("Validation failed", messages));
      }
      return next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.query);
      req.query = result as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map(
          (e: any) => `${e.path.join(".")}: ${e.message}`
        );
        return next(ApiError.badRequest("Query validation failed", messages));
      }
      return next(error);
    }
  };
};
