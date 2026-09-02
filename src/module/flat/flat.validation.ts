import { z } from "zod";

const createFlatValidationSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  name: z.string().min(1, "Flat name is required"),
  floor: z.number().int(),
  rent: z.number().positive("Rent must be a positive number"),
  description: z.string().min(1, "Description is required"),
});

const updateFlatValidationSchema = z.object({
  name: z.string().min(1).optional(),
  floor: z.number().int().optional(),
  rent: z.number().positive().optional(),
  description: z.string().min(1).optional(),
  status: z
    .enum(["AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE", "INACTIVE"])
    .optional(),
});

export const FlatValidation = {
  createFlatValidationSchema,
  updateFlatValidationSchema,
};
