import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { pick } from "../../utils/pick";
import { ApplicationService } from "./application.service";

const createApplication = catchAsync(async (req, res) => {
  const result = await ApplicationService.createApplication(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Application submitted successfully",
    data: result,
  });
});

const getAllApplications = catchAsync(async (req, res) => {
  const filters = pick(req.query, ["status", "rentalType", "flatId"]);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await ApplicationService.getAllApplications(filters, { page, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Applications retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMyApplications = catchAsync(async (req, res) => {
  const result = await ApplicationService.getMyApplications(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your applications retrieved successfully",
    data: result,
  });
});

const getOwnerApplications = catchAsync(async (req, res) => {
  const result = await ApplicationService.getOwnerApplications(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Applications for your properties retrieved successfully",
    data: result,
  });
});

const getApplicationById = catchAsync(async (req, res) => {
  const result = await ApplicationService.getApplicationById(req.params.applicationId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Application retrieved successfully",
    data: result,
  });
});

const approveApplication = catchAsync(async (req, res) => {
  const result = await ApplicationService.approveApplication(
    req.params.applicationId as string,
    req.user!.userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Application approved successfully. Booking created — awaiting payment.",
    data: result,
  });
});

const rejectApplication = catchAsync(async (req, res) => {
  const result = await ApplicationService.rejectApplication(
    req.params.applicationId as string,
    req.user!.userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Application rejected",
    data: result,
  });
});

const cancelApplication = catchAsync(async (req, res) => {
  const result = await ApplicationService.cancelApplication(
    req.params.applicationId as string,
    req.user!.userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Application cancelled",
    data: result,
  });
});

export const ApplicationController = {
  createApplication,
  getAllApplications,
  getMyApplications,
  getOwnerApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  cancelApplication,
};