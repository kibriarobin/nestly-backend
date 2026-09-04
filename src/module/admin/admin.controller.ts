import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { pick } from "../../utils/pick";
import { AdminService } from "./admin.service";
import { Request, Response } from "express";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["role", "status", "searchTerm"]);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await AdminService.getAllUsers(filters, { page, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.updateUserStatus(
    req.user!.userId,
    req.params.userId as string,
    req.body.status,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getDashboardStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard statistics retrieved successfully",
    data: result,
  });
});

const getOwnerPropertyStats = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdminService.getOwnerPropertyStats();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Owner-wise property stats retrieved successfully",
      data: result,
    });
  },
);

const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await AdminService.getAuditLogs({ page, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Audit logs retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const AdminController = {
  getAllUsers,
  updateUserStatus,
  getDashboardStats,
  getOwnerPropertyStats,
  getAuditLogs,
};
