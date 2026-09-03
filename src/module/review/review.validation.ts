import { z } from "zod";

const createReviewValidationSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  flatId: z.string().uuid("Invalid flat ID").optional(),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().optional(),
});

const updateReviewValidationSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export const ReviewValidation = {
  createReviewValidationSchema,
  updateReviewValidationSchema,
};