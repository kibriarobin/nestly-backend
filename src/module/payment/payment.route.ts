import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";

const router = Router();

router.post("/create", auth(UserRole.TENANT), paymentController.createPayment);

router.post("/confirm", paymentController.confirmPayment);

router.get("/confirm", paymentController.confirmPayment);

router.get("/", auth(UserRole.TENANT), paymentController.getMyPayments);

router.get("/:paymentId", auth(UserRole.TENANT), paymentController.getPaymentById);

export const paymentRoutes = router;