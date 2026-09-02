import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.register,
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login,
);

router.get(
  "/me",
  auth(UserRole.OWNER, UserRole.TENANT, UserRole.ADMIN),
  AuthController.getMe,
);

router.post("/refresh-token", AuthController.refreshToken);

router.post("/logout", AuthController.logout);

export const AuthRoutes = router;
