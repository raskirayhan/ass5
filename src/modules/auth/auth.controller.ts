import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { authService } from "./auth.service";

const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json(ApiResponse.created(result, "Registration successful"));
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.status(200).json(ApiResponse.success(result, "Login successful"));
});

const getMe = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getMe(req.user!.userId);
  res.status(200).json(ApiResponse.success(result, "Profile fetched successfully"));
});

export const authController = { register, login, getMe };
