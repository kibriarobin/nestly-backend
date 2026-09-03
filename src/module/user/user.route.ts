import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = Router();

router.get(
  "/me",
  auth(UserRole.OWNER, UserRole.TENANT, UserRole.ADMIN),
  UserController.getMyProfile,
);

router.patch(
  "/me",
  auth(UserRole.OWNER, UserRole.TENANT, UserRole.ADMIN),
  validateRequest(UserValidation.updateProfileValidationSchema),
  UserController.updateMyProfile,
);

export const UserRoutes = router;
