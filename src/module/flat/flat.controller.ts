import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { pick } from "../../utils/pick";
import { FlatService } from "./flat.service";
import { Request, Response } from "express";

const createFlat = catchAsync(async (req: Request, res: Response) => {
  const result = await FlatService.createFlat(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Flat created successfully",
    data: result,
  });
});

const getAllFlats = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    "propertyId",
    "status",
    "city",
    "searchTerm",
  ]);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const onlyApproved = req.user?.role !== "ADMIN" && req.user?.role !== "OWNER";

  const result = await FlatService.getAllFlats(
    { ...filters, onlyApproved },
    { page, limit },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Flats retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMyFlats = catchAsync(async (req: Request, res: Response) => {
  const result = await FlatService.getMyFlats(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your flats retrieved successfully",
    data: result,
  });
});

const getFlatById = catchAsync(async (req: Request, res: Response) => {
  const result = await FlatService.getFlatById(req.params.flatId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Flat retrieved successfully",
    data: result,
  });
});

const updateFlat = catchAsync(async (req: Request, res: Response) => {
  const result = await FlatService.updateFlat(
    req.params.flatId as string,
    req.user!.userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Flat updated successfully",
    data: result,
  });
});

const deleteFlat = catchAsync(async (req: Request, res: Response) => {
  const result = await FlatService.deleteFlat(
    req.params.flatId as string,
    req.user!.userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Flat deleted successfully",
    data: result,
  });
});

export const FlatController = {
  createFlat,
  getAllFlats,
  getMyFlats,
  getFlatById,
  updateFlat,
  deleteFlat,
};
