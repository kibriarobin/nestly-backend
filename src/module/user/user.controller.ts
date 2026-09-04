import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";
import { Request, Response } from "express";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getMyProfile(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateMyProfile(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const UserController = {
  getMyProfile,
  updateMyProfile,
};
