import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";
import config from "../../config";

const cookieOptions = {
  httpOnly: true,
  secure: config.node_env === "production",
  sameSite: (config.node_env === "production" ? "none" : "lax") as "none" | "lax",
};

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);

  res.cookie("accessToken", result.tokens.accessToken, cookieOptions);
  res.cookie("refreshToken", result.tokens.refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  res.cookie("accessToken", result.tokens.accessToken, cookieOptions);
  res.cookie("refreshToken", result.tokens.refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in successfully",
    data: result,
  });
});

const googleCallback = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as unknown as {
    id: string;
    email: string;
    role: string;
    name: string;
  };

  const tokens = AuthService.generateTokens({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  res.cookie("accessToken", tokens.accessToken, cookieOptions);
  res.cookie("refreshToken", tokens.refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in with Google successfully",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken ?? req.body?.refreshToken;

  const result = await AuthService.refreshToken(token);

  res.cookie("accessToken", result.accessToken, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token refreshed successfully",
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

export const AuthController = {
  register,
  login,
  googleCallback,
  refreshToken,
  logout,
};