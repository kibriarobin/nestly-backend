import type z from "zod";
import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const validateRequest = (zodSchema: z.ZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body ?? {};

    const result = zodSchema.safeParse(payload);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Validation failed";
      throw new AppError(400, message);
    }
    req.body = result.data;
    next();
  });
};
