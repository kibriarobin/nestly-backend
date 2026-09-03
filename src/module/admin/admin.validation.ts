import { z } from "zod";

const updateUserStatusValidationSchema = z.object({
  status: z.enum(["ACTIVE", "BLOCKED"]),
});

export const AdminValidation = {
  updateUserStatusValidationSchema,
};