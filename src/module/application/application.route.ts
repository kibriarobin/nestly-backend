import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { ApplicationController } from "./application.controller";
import { ApplicationValidation } from "./application.validation";

const router = Router();

router.post(
  "/",
  auth(UserRole.TENANT),
  validateRequest(ApplicationValidation.createApplicationValidationSchema),
  ApplicationController.createApplication,
);

router.get(
  "/my-applications",
  auth(UserRole.TENANT),
  ApplicationController.getMyApplications,
);

router.get(
  "/owner-applications",
  auth(UserRole.OWNER),
  ApplicationController.getOwnerApplications,
);

router.get("/", auth(UserRole.ADMIN), ApplicationController.getAllApplications);

router.get(
  "/:applicationId",
  auth(UserRole.OWNER, UserRole.TENANT, UserRole.ADMIN),
  ApplicationController.getApplicationById,
);

router.patch(
  "/:applicationId/approve",
  auth(UserRole.OWNER),
  ApplicationController.approveApplication,
);

router.patch(
  "/:applicationId/reject",
  auth(UserRole.OWNER),
  ApplicationController.rejectApplication,
);

router.patch(
  "/:applicationId/cancel",
  auth(UserRole.TENANT),
  ApplicationController.cancelApplication,
);

export const ApplicationRoutes = router;
