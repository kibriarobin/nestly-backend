import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { IBookingFilters } from "./booking.interface";

const getAllBookings = async (
  filters: IBookingFilters,
  options: { page: number; limit: number },
) => {
  const { status, rentalType } = filters;
  const { page, limit } = options;

  const andConditions: any[] = [{ deletedAt: null }];
  if (status) andConditions.push({ status });
  if (rentalType) andConditions.push({ rentalType });

  const whereConditions = { AND: andConditions };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: whereConditions,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        flat: {
          select: {
            id: true,
            name: true,
            property: { select: { title: true } },
          },
        },
        room: { select: { id: true, name: true } },
        payment: true,
      },
    }),
    prisma.booking.count({ where: whereConditions }),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: bookings,
  };
};

const getMyBookings = async (tenantId: string) => {
  return prisma.booking.findMany({
    where: { tenantId, deletedAt: null },
    include: {
      flat: {
        select: {
          id: true,
          name: true,
          property: { select: { title: true, city: true } },
        },
      },
      room: { select: { id: true, name: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getOwnerBookings = async (ownerId: string) => {
  return prisma.booking.findMany({
    where: { deletedAt: null, flat: { property: { ownerId } } },
    include: {
      tenant: { select: { id: true, name: true, email: true, phone: true } },
      flat: {
        select: { id: true, name: true, property: { select: { title: true } } },
      },
      room: { select: { id: true, name: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getBookingById = async (id: string) => {
  const booking = await prisma.booking.findFirst({
    where: { id, deletedAt: null },
    include: {
      tenant: { select: { id: true, name: true, email: true } },
      flat: { include: { property: true } },
      room: true,
      payment: true,
      application: true,
    },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  return booking;
};

const cancelBooking = async (bookingId: string, tenantId: string) => {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: { id: bookingId, deletedAt: null },
    });

    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    if (booking.tenantId !== tenantId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You can only cancel your own booking",
      );
    }

    if (booking.status !== "PENDING") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Cannot cancel a booking with status ${booking.status}`,
      );
    }

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    await tx.application.update({
      where: { id: booking.applicationId },
      data: { status: "CANCELLED" },
    });

    if (booking.rentalType === "ROOM" && booking.roomId) {
      await tx.room.update({
        where: { id: booking.roomId },
        data: { status: "AVAILABLE" },
      });
    } else {
      await tx.flat.update({
        where: { id: booking.flatId },
        data: { status: "AVAILABLE" },
      });
    }

    return updatedBooking;
  });
};

export const BookingService = {
  getAllBookings,
  getMyBookings,
  getOwnerBookings,
  getBookingById,
  cancelBooking,
};
