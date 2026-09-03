import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import { authLimiter } from "../../middleware/rateLimiter";
import passport from "../../utils/passport";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.register,
);

router.post(
  "/login",
  authLimiter,
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login,
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/api/v1/auth/google/failure" }),
  AuthController.googleCallback,
);

router.get("/google/failure", (req, res) => {
  res.status(401).json({
    success: false,
    statusCode: 401,
    message: "Google authentication failed",
    errors: [],
  });
});

router.post("/refresh-token", AuthController.refreshToken);

router.post("/logout", AuthController.logout);

export const AuthRoutes = router;
