import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { BookingController } from "./booking.controller";

const router = Router();

router.get("/", auth(UserRole.ADMIN), BookingController.getAllBookings);

router.get(
  "/my-bookings",
  auth(UserRole.TENANT),
  BookingController.getMyBookings,
);

router.get(
  "/owner-bookings",
  auth(UserRole.OWNER),
  BookingController.getOwnerBookings,
);

router.get(
  "/:bookingId",
  auth(UserRole.OWNER, UserRole.TENANT, UserRole.ADMIN),
  BookingController.getBookingById,
);

router.patch(
  "/:bookingId/cancel",
  auth(UserRole.TENANT),
  BookingController.cancelBooking,
);

export const BookingRoutes = router;
