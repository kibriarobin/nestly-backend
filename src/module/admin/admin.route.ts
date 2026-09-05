import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { AdminController } from "./admin.controller";
import { AdminValidation } from "./admin.validation";

const router = Router();

router.get("/users", auth(UserRole.ADMIN), AdminController.getAllUsers);

router.patch(
  "/users/status/:userId",
  auth(UserRole.ADMIN),
  validateRequest(AdminValidation.updateUserStatusValidationSchema),
  AdminController.updateUserStatus,
);

router.get(
  "/dashboard-stats",
  auth(UserRole.ADMIN),
  AdminController.getDashboardStats,
);

router.get(
  "/owner-stats",
  auth(UserRole.ADMIN),
  AdminController.getOwnerPropertyStats,
);

router.get("/audit-logs", auth(UserRole.ADMIN), AdminController.getAuditLogs);

export const AdminRoutes = router;
