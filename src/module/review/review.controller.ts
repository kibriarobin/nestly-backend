import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req, res) => {
  const result = await ReviewService.createReview(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review submitted successfully",
    data: result,
  });
});

const getReviewsForProperty = catchAsync(async (req, res) => {
  const propertyId = req.params.propertyId as string;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await ReviewService.getReviewsForProperty(propertyId, { page, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews retrieved successfully",
    data: { averageRating: result.averageRating, reviews: result.data },
    meta: result.meta,
  });
});

const getReviewById = catchAsync(async (req, res) => {
  const result = await ReviewService.getReviewById(req.params.reviewId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review retrieved successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req, res) => {
  const result = await ReviewService.updateReview(
    req.params.reviewId as string,
    req.user!.userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req, res) => {
  const result = await ReviewService.deleteReview(req.params.reviewId as string, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getReviewsForProperty,
  getReviewById,
  updateReview,
  deleteReview,
};