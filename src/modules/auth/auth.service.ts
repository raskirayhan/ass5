import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config";
import { ApiError } from "../../utils/ApiError";
import { sanitizeUser } from "../../helpers";
import { RegisterInput, LoginInput } from "./auth.validation";
import prisma from "../../prisma";

const register = async (dto: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (existingUser) {
    throw ApiError.conflict("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(dto.password, 12);

  const createdUser = await prisma.user.create({
    data: {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      phone: dto.phone,
      address: dto.address,
      role: dto.role as Role,
      ...(dto.role === "TECHNICIAN" && {
        technicianProfile: {
          create: {},
        },
      }),
    },
    include: {
      technicianProfile: true,
    },
  });

  const token = jwt.sign(
    { userId: createdUser.id, email: createdUser.email, role: createdUser.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as string } as jwt.SignOptions
  );

  return { user: sanitizeUser(createdUser), token };
};

const login = async (dto: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const isPasswordValid = await bcrypt.compare(dto.password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as string } as jwt.SignOptions
  );

  return { user: sanitizeUser(user), token };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { technicianProfile: { include: { user: false } } },
  });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return sanitizeUser(user);
};

export const authService = { register, login, getMe };
