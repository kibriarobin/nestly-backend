import { z } from "zod";

const updateProfileValidationSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(100).optional(),
  phone: z.string().optional(),
});

export const UserValidation = {
  updateProfileValidationSchema,
};
