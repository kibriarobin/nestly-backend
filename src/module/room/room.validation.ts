import { z } from "zod";

const createRoomValidationSchema = z.object({
  flatId: z.string().uuid("Invalid flat ID"),
  name: z.string().min(1, "Room name is required"),
  rent: z.number().positive("Rent must be a positive number"),
  description: z.string().min(1, "Description is required"),
});

const updateRoomValidationSchema = z.object({
  name: z.string().min(1).optional(),
  rent: z.number().positive().optional(),
  description: z.string().optional(),
  status: z
    .enum(["AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE", "INACTIVE"])
    .optional(),
});

export const RoomValidation = {
  createRoomValidationSchema,
  updateRoomValidationSchema,
};
