import bcrypt from "bcrypt";
import httpStatus from "http-status";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { jwtUtils } from "../../utils/jwt";
import type { IRegisterPayload, ILoginPayload, IAuthTokens } from "./auth.interface";
import { sanitizeUser } from "../../utils/sanitizeUser";

const registerUser = async (payload: IRegisterPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, Number(config.bcrypt_salt_rounds));

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
      phone: payload.phone,
    },
  });

  const tokens = jwtUtils.generateAuthTokens({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return { user: sanitizeUser(user), tokens };
};

const loginUser = async (payload: ILoginPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user || user.deletedAt) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  if (user.status === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "Your account has been blocked. Please contact support.");
  }

  if (!user.password) {
    throw new AppError(httpStatus.BAD_REQUEST, "This account uses Google login. Please sign in with Google.");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const tokens = jwtUtils.generateAuthTokens({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return { user: sanitizeUser(user), tokens };
};

const generateTokens = (payload: {
  userId: string;
  email: string;
  name: string;
  role: string;
}): IAuthTokens => {
  const accessToken = jwtUtils.createToken(
    payload,
    config.jwt_access_secret,
    config.jwt_access_expiration,
  );

  const refreshToken = jwtUtils.createToken(
    payload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expiration,
  );

  return { accessToken, refreshToken };
};

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "No refresh token provided. Please log in again.");
  }

  const decoded = jwtUtils.verifyToken(token, config.jwt_refresh_secret) as {
    userId: string;
    email: string;
    name: string;
    role: string;
  };

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId, email: decoded.email, role: decoded.role as any },
  });

  if (!user || user.deletedAt) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not found. Please log in again.");
  }

  if (user.status === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "Your account has been blocked. Please contact support.");
  }

  const newAccessToken = jwtUtils.createToken(
    { userId: user.id, email: user.email, name: user.name, role: user.role },
    config.jwt_access_secret,
    config.jwt_access_expiration,
  );

  return { accessToken: newAccessToken };
};

export const AuthService = {
  registerUser,
  loginUser,
  generateTokens,
  refreshToken,
};