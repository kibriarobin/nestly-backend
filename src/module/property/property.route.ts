import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { PropertyController } from "./property.controller";
import { PropertyValidation } from "./property.validation";

const router = Router();

router.post(
  "/",
  auth(UserRole.OWNER),
  validateRequest(PropertyValidation.createPropertyValidationSchema),
  PropertyController.createProperty,
);

router.get(
  "/my-properties",
  auth(UserRole.OWNER),
  PropertyController.getMyProperties,
);

router.get("/", PropertyController.getAllProperties);

router.get("/:propertyId", PropertyController.getPropertyById);

router.patch(
  "/:propertyId",
  auth(UserRole.OWNER),
  validateRequest(PropertyValidation.updatePropertyValidationSchema),
  PropertyController.updateProperty,
);

router.delete(
  "/:propertyId",
  auth(UserRole.OWNER),
  PropertyController.deleteProperty,
);

router.patch(
  "/status/:propertyId",
  auth(UserRole.ADMIN),
  PropertyController.updatePropertyStatus,
);

export const PropertyRoutes = router;
