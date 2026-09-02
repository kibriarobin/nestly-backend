import { z } from "zod";

const createApplicationValidationSchema = z
  .object({
    flatId: z.string().uuid("Invalid flat ID"),
    roomId: z.string().uuid("Invalid room ID").optional(),
    rentalType: z.enum(["ROOM", "FLAT"]),
    message: z.string().optional(),
  })
  .refine((data) => (data.rentalType === "ROOM" ? !!data.roomId : true), {
    message: "roomId is required when rentalType is ROOM",
    path: ["roomId"],
  })
  .refine((data) => (data.rentalType === "FLAT" ? !data.roomId : true), {
    message: "roomId must not be provided when rentalType is FLAT",
    path: ["roomId"],
  });

const updateApplicationStatusValidationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const ApplicationValidation = {
  createApplicationValidationSchema,
  updateApplicationStatusValidationSchema,
};
