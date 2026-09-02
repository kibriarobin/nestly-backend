import { z } from "zod";

const createPropertyValidationSchema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  description: z.string().min(1, "Description is required"),
});

const updatePropertyValidationSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
});

export const PropertyValidation = {
  createPropertyValidationSchema,
  updatePropertyValidationSchema,
};