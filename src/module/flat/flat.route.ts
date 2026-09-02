import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { FlatController } from "./flat.controller";
import { FlatValidation } from "./flat.validation";

const router = Router();

router.post(
  "/",
  auth(UserRole.OWNER),
  validateRequest(FlatValidation.createFlatValidationSchema),
  FlatController.createFlat,
);

router.get("/my-flats", auth(UserRole.OWNER), FlatController.getMyFlats);

router.get("/", FlatController.getAllFlats);

router.get("/:flatId", FlatController.getFlatById);

router.patch(
  "/:flatId",
  auth(UserRole.OWNER),
  validateRequest(FlatValidation.updateFlatValidationSchema),
  FlatController.updateFlat,
);

router.delete("/:flatId", auth(UserRole.OWNER), FlatController.deleteFlat);

export const FlatRoutes = router;
