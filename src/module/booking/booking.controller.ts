import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { pick } from "../../utils/pick";
import { BookingService } from "./booking.service";

const getAllBookings = catchAsync(async (req, res) => {
  const filters = pick(req.query, ["status", "rentalType"]);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await BookingService.getAllBookings(filters, { page, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bookings retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMyBookings = catchAsync(async (req, res) => {
  const result = await BookingService.getMyBookings(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your bookings retrieved successfully",
    data: result,
  });
});

const getOwnerBookings = catchAsync(async (req, res) => {
  const result = await BookingService.getOwnerBookings(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bookings for your properties retrieved successfully",
    data: result,
  });
});

const getBookingById = catchAsync(async (req, res) => {
  const result = await BookingService.getBookingById(
    req.params.bookingId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking retrieved successfully",
    data: result,
  });
});

const cancelBooking = catchAsync(async (req, res) => {
  const result = await BookingService.cancelBooking(
    req.params.bookingId as string,
    req.user!.userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking cancelled successfully",
    data: result,
  });
});

export const BookingController = {
  getAllBookings,
  getMyBookings,
  getOwnerBookings,
  getBookingById,
  cancelBooking,
};
