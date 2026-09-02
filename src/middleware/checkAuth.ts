import type { NextFunction, Request, Response } from "express";
import config from "../config";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import { AppError } from "../utils/AppError";
import { UserRole } from "../../generated/prisma/enums";

export interface RequestUser {
  email: string;
  name: string;
  userId: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new AppError(
        401,
        "You are not logged in. Please log in to access this resource.",
      );
    }

    const decoded = jwtUtils.verifyToken(
      token,
      config.jwt_access_secret,
    ) as RequestUser;
    const { email, name, userId, role } = decoded;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError(
        403,
        "Forbidden. You don't have permission to access this resource.",
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId, email, name, role },
    });

    if (!user || user.deletedAt) {
      throw new AppError(401, "User not found. Please log in again.");
    }

    if (user.status === "BLOCKED") {
      throw new AppError(
        403,
        "Your account has been blocked. Please contact support.",
      );
    }

    req.user = { email, name, userId, role };

    next();
  });
};
