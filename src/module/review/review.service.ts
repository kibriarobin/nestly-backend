import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface";

const createReview = async (tenantId: string, payload: ICreateReviewPayload) => {
  const property = await prisma.property.findFirst({
    where: { id: payload.propertyId, deletedAt: null },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  const eligibleBooking = await prisma.booking.findFirst({
    where: {
      tenantId,
      flat: { propertyId: payload.propertyId },
      status: { in: ["CONFIRMED", "COMPLETED"] },
      deletedAt: null,
    },
  });

  if (!eligibleBooking) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only review a property you have booked and stayed in",
    );
  }

  const existingReview = await prisma.review.findFirst({
    where: { tenantId, propertyId: payload.propertyId, deletedAt: null },
  });

  if (existingReview) {
    throw new AppError(httpStatus.CONFLICT, "You have already reviewed this property");
  }

  const review = await prisma.review.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      flatId: payload.flatId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });

  return review;
};

const getReviewsForProperty = async (
  propertyId: string,
  options: { page: number; limit: number },
) => {
  const { page, limit } = options;

  const whereConditions = { propertyId, deletedAt: null };

  const [reviews, total, avgRating] = await Promise.all([
    prisma.review.findMany({
      where: whereConditions,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { tenant: { select: { id: true, name: true } } },
    }),
    prisma.review.count({ where: whereConditions }),
    prisma.review.aggregate({
      where: whereConditions,
      _avg: { rating: true },
    }),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    averageRating: avgRating._avg.rating ?? 0,
    data: reviews,
  };
};

const getReviewById = async (id: string) => {
  const review = await prisma.review.findFirst({
    where: { id, deletedAt: null },
    include: {
      tenant: { select: { id: true, name: true } },
      property: { select: { id: true, title: true } },
    },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  return review;
};

const updateReview = async (id: string, tenantId: string, payload: IUpdateReviewPayload) => {
  const review = await prisma.review.findFirst({
    where: { id, deletedAt: null },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  if (review.tenantId !== tenantId) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only update your own review");
  }

  const updated = await prisma.review.update({
    where: { id },
    data: payload,
  });

  return updated;
};

const deleteReview = async (id: string, tenantId: string) => {
  const review = await prisma.review.findFirst({
    where: { id, deletedAt: null },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  if (review.tenantId !== tenantId) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only delete your own review");
  }

  const deleted = await prisma.review.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return deleted;
};

export const ReviewService = {
  createReview,
  getReviewsForProperty,
  getReviewById,
  updateReview,
  deleteReview,
};