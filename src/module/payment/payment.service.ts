import httpStatus from "http-status";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { sslCommerzUtils } from "./payment.utils";
import { IInitiatePaymentPayload } from "./payment.interface";

const createPayment = async (
  tenantId: string,
  payload: IInitiatePaymentPayload,
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: { tenant: true, payment: true },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.tenantId !== tenantId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only pay for your own booking",
    );
  }

  if (booking.status !== "PENDING") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot initiate payment for a booking with status ${booking.status}`,
    );
  }

  if (booking.payment) {
    if (booking.payment.status === "PAID") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This booking is already paid",
      );
    }
    await prisma.payment.delete({ where: { id: booking.payment.id } });
  }

  const transactionId = `NESTLY_${uuidv4()}`;

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      tenantId: booking.tenantId,
      transactionId,
      amount: booking.rent,
      method: "SSLCOMMERZ",
      status: "PENDING",
    },
  });

  const sslResponse = await sslCommerzUtils.initiatePayment({
    amount: Number(booking.rent),
    transactionId,
    customerName: booking.tenant.name,
    customerEmail: booking.tenant.email,
    customerPhone: booking.tenant.phone ?? undefined,
  });

  if (!sslResponse?.GatewayPageURL) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "Failed to initiate payment with SSLCommerz",
    );
  }

  return { paymentUrl: sslResponse.GatewayPageURL };
};

const confirmPayment = async (transactionId: string, valId: string) => {
  const payment = await prisma.payment.findUnique({ where: { transactionId } });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment record not found");
  }

  if (payment.status === "PAID") {
    return { alreadyProcessed: true, bookingId: payment.bookingId };
  }

  const validation = await sslCommerzUtils.validatePayment(valId);

  if (validation.status !== "VALID" && validation.status !== "VALIDATED") {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment validation failed");
  }

  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: payment.bookingId } });

    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    if (booking.status === "CANCELLED") {
      await tx.payment.update({
        where: { transactionId },
        data: { status: "FAILED", gatewayData: validation },
      });
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Booking was cancelled before payment could be confirmed",
      );
    }

    if (booking.status !== "PENDING") {
      return { alreadyProcessed: true, bookingId: booking.id };
    }

    const updatedPayment = await tx.payment.update({
      where: { transactionId },
      data: { status: "PAID", paidAt: new Date(), gatewayData: validation },
    });

    const updatedBooking = await tx.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED", confirmedAt: new Date() },
    });

    await tx.application.update({
      where: { id: booking.applicationId },
      data: { status: "CONFIRMED" },
    });

    if (booking.rentalType === "ROOM" && booking.roomId) {
      await tx.room.update({ where: { id: booking.roomId }, data: { status: "OCCUPIED" } });
    } else {
      await tx.flat.update({ where: { id: booking.flatId }, data: { status: "OCCUPIED" } });
    }

    await tx.auditLog.create({
      data: {
        userId: booking.tenantId,
        action: "PAYMENT",
        entity: "Payment",
        entityId: updatedPayment.id,
        description: `Payment confirmed for booking ${booking.id}`,
      },
    });

    return { payment: updatedPayment, booking: updatedBooking, bookingId: booking.id };
  });

  return result;
};

const getMyPayments = async (tenantId: string) => {
  return prisma.payment.findMany({
    where: { booking: { tenantId } },
    include: {
      booking: {
        include: {
          flat: {
            select: {
              name: true,
              rent: true,
              property: { select: { title: true } },
            },
          },
          room: { select: { name: true, rent: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getPaymentById = async (paymentId: string, tenantId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: true },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (payment.booking.tenantId !== tenantId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to view this payment",
    );
  }

  return payment;
};

export const paymentService = {
  createPayment,
  confirmPayment,
  getMyPayments,
  getPaymentById,
};
