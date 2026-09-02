import { z } from "zod";

const registerValidationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["OWNER", "TENANT"], {
    message: "Role must be either OWNER or TENANT",
  }),
  phone: z.string().optional(),
});

const loginValidationSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
};