import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";

const router = Router();

router.post(
  "/",
  auth(UserRole.TENANT),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReview,
);

router.get("/property/:propertyId", ReviewController.getReviewsForProperty);

router.get("/:reviewId", ReviewController.getReviewById);

router.patch(
  "/:reviewId",
  auth(UserRole.TENANT),
  validateRequest(ReviewValidation.updateReviewValidationSchema),
  ReviewController.updateReview,
);

router.delete(
  "/:reviewId",
  auth(UserRole.TENANT),
  ReviewController.deleteReview,
);

export const ReviewRoutes = router;
