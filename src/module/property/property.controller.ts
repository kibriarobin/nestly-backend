import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PropertyService } from "./property.service";
import { pick } from "../../utils/pick";

const createProperty = catchAsync(async (req, res) => {
  const result = await PropertyService.createProperty(
    req.user!.userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Property created successfully. Awaiting admin approval.",
    data: result,
  });
});

const getAllProperties = catchAsync(async (req, res) => {
  const filters = pick(req.query, ["city", "status", "searchTerm"]);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (req.user?.role !== "ADMIN") {
    filters.status = "APPROVED";
  }

  const result = await PropertyService.getAllProperties(filters, {
    page,
    limit,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Properties retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMyProperties = catchAsync(async (req, res) => {
  const result = await PropertyService.getMyProperties(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your properties retrieved successfully",
    data: result,
  });
});

const getPropertyById = catchAsync(async (req, res) => {
  const propertyId = req.params.propertyId as string;
  const result = await PropertyService.getPropertyById(propertyId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Property retrieved successfully",
    data: result,
  });
});

const updateProperty = catchAsync(async (req, res) => {
  const propertyId = req.params.propertyId as string;
  const result = await PropertyService.updateProperty(
    propertyId,
    req.user!.userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Property updated successfully",
    data: result,
  });
});

const deleteProperty = catchAsync(async (req, res) => {
  const propertyId = req.params.propertyId as string;
  const result = await PropertyService.deleteProperty(
    propertyId,
    req.user!.userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Property deleted successfully",
    data: result,
  });
});

const updatePropertyStatus = catchAsync(async (req, res) => {
  const propertyId = req.params.propertyId as string;
  const result = await PropertyService.updatePropertyStatus(
    propertyId,
    req.user!.userId,
    req.body.status,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Property status updated successfully",
    data: result,
  });
});

export const PropertyController = {
  createProperty,
  getAllProperties,
  getMyProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
};
