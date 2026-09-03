import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const register = catchAsync(async (req, res) => {
  const result = await AuthService.registerUser(req.body);

  res.cookie("accessToken", result.tokens.accessToken, { httpOnly: true });
  res.cookie("refreshToken", result.tokens.refreshToken, { httpOnly: true });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const result = await AuthService.loginUser(req.body);

  res.cookie("accessToken", result.tokens.accessToken, { httpOnly: true });
  res.cookie("refreshToken", result.tokens.refreshToken, { httpOnly: true });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in successfully",
    data: result,
  });
});

const googleCallback = catchAsync(async (req, res) => {
  const user = req.user as unknown as { id: string; email: string; role: string; name: string };

  const tokens = AuthService.generateTokens({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  res.cookie("accessToken", tokens.accessToken, { httpOnly: true });
  res.cookie("refreshToken", tokens.refreshToken, { httpOnly: true });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in with Google successfully",
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tokens,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken ?? req.body?.refreshToken;

  const result = await AuthService.refreshToken(token);

  res.cookie("accessToken", result.accessToken, { httpOnly: true });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token refreshed successfully",
    data: result,
  });
});

const logout = catchAsync(async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

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
