import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { ICreateApplicationPayload, IApplicationFilters } from "./application.interface";

const createApplication = async (tenantId: string, payload: ICreateApplicationPayload) => {
  const flat = await prisma.flat.findFirst({
    where: { id: payload.flatId, deletedAt: null },
    include: { property: true },
  });

  if (!flat) {
    throw new AppError(httpStatus.NOT_FOUND, "Flat not found");
  }

  if (flat.property.status !== "APPROVED") {
    throw new AppError(httpStatus.BAD_REQUEST, "This property is not open for applications");
  }

  let rent = flat.rent;

  if (payload.rentalType === "ROOM") {
    const room = await prisma.room.findFirst({
      where: { id: payload.roomId, flatId: payload.flatId, deletedAt: null },
    });

    if (!room) {
      throw new AppError(httpStatus.NOT_FOUND, "Room not found in this flat");
    }

    if (room.status !== "AVAILABLE") {
      throw new AppError(httpStatus.BAD_REQUEST, "This room is not currently available");
    }

    rent = room.rent;
  } else {
    if (flat.status !== "AVAILABLE") {
      throw new AppError(httpStatus.BAD_REQUEST, "This flat is not currently available");
    }
  }

  if (!rent) {
    throw new AppError(httpStatus.BAD_REQUEST, "Rent amount is not set for this listing");
  }

  const existingActive = await prisma.application.findFirst({
    where: {
      tenantId,
      flatId: payload.flatId,
      roomId: payload.roomId ?? null,
      status: { in: ["PENDING", "UNDER_REVIEW"] },
      deletedAt: null,
    },
  });

  if (existingActive) {
    throw new AppError(httpStatus.CONFLICT, "You already have an active application for this listing");
  }

  const application = await prisma.application.create({
    data: {
      tenantId,
      flatId: payload.flatId,
      roomId: payload.roomId,
      rentalType: payload.rentalType,
      rent,
      message: payload.message,
    },
  });

  return application;
};

const getAllApplications = async (
  filters: IApplicationFilters,
  options: { page: number; limit: number },
) => {
  const { status, rentalType, flatId } = filters;
  const { page, limit } = options;

  const andConditions: any[] = [{ deletedAt: null }];

  if (status) andConditions.push({ status });
  if (rentalType) andConditions.push({ rentalType });
  if (flatId) andConditions.push({ flatId });

  const whereConditions = { AND: andConditions };

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where: whereConditions,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        flat: { select: { id: true, name: true, property: { select: { title: true } } } },
        room: { select: { id: true, name: true } },
      },
    }),
    prisma.application.count({ where: whereConditions }),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: applications,
  };
};

const getMyApplications = async (tenantId: string) => {
  return prisma.application.findMany({
    where: { tenantId, deletedAt: null },
    include: {
      flat: { select: { id: true, name: true, property: { select: { title: true, city: true } } } },
      room: { select: { id: true, name: true } },
      booking: true,
    },
    orderBy: { createdAt: "desc" },
  });
};


const getOwnerApplications = async (ownerId: string) => {
  return prisma.application.findMany({
    where: {
      deletedAt: null,
      flat: { property: { ownerId } },
    },
    include: {
      tenant: { select: { id: true, name: true, email: true, phone: true } },
      flat: { select: { id: true, name: true, property: { select: { title: true } } } },
      room: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getApplicationById = async (id: string) => {
  const application = await prisma.application.findFirst({
    where: { id, deletedAt: null },
    include: {
      tenant: { select: { id: true, name: true, email: true } },
      flat: { include: { property: true } },
      room: true,
      booking: true,
    },
  });

  if (!application) {
    throw new AppError(httpStatus.NOT_FOUND, "Application not found");
  }

  return application;
};


const approveApplication = async (applicationId: string, ownerId: string) => {
  return prisma.$transaction(async (tx) => {
    const application = await tx.application.findFirst({
      where: { id: applicationId, deletedAt: null },
      include: { flat: { include: { property: true } }, room: true },
    });

    if (!application) {
      throw new AppError(httpStatus.NOT_FOUND, "Application not found");
    }

    if (application.flat.property.ownerId !== ownerId) {
      throw new AppError(httpStatus.FORBIDDEN, "You can only approve applications for your own property");
    }

    if (application.status !== "PENDING" && application.status !== "UNDER_REVIEW") {
      throw new AppError(httpStatus.BAD_REQUEST, `Cannot approve an application with status ${application.status}`);
    }

    if (application.rentalType === "ROOM") {
      if (application.room?.status !== "AVAILABLE") {
        throw new AppError(httpStatus.CONFLICT, "This room is no longer available");
      }
    } else if (application.flat.status !== "AVAILABLE") {
      throw new AppError(httpStatus.CONFLICT, "This flat is no longer available");
    }

    const updatedApplication = await tx.application.update({
      where: { id: applicationId },
      data: { status: "APPROVED", approvedAt: new Date() },
    });

    const booking = await tx.booking.create({
      data: {
        applicationId,
        tenantId: application.tenantId,
        flatId: application.flatId,
        roomId: application.roomId,
        rentalType: application.rentalType,
        rent: application.rent,
      },
    });

    if (application.rentalType === "ROOM" && application.roomId) {
      await tx.room.update({
        where: { id: application.roomId },
        data: { status: "RESERVED" },
      });
    } else {
      await tx.flat.update({
        where: { id: application.flatId },
        data: { status: "RESERVED" },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: ownerId,
        action: "APPROVE",
        entity: "Application",
        entityId: applicationId,
        description: `Application approved, booking ${booking.id} created`,
      },
    });

    return { application: updatedApplication, booking };
  });
};

const rejectApplication = async (applicationId: string, ownerId: string) => {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, deletedAt: null },
    include: { flat: { include: { property: true } } },
  });

  if (!application) {
    throw new AppError(httpStatus.NOT_FOUND, "Application not found");
  }

  if (application.flat.property.ownerId !== ownerId) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only reject applications for your own property");
  }

  if (application.status !== "PENDING" && application.status !== "UNDER_REVIEW") {
    throw new AppError(httpStatus.BAD_REQUEST, `Cannot reject an application with status ${application.status}`);
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status: "REJECTED" },
  });

  await prisma.auditLog.create({
    data: {
      userId: ownerId,
      action: "REJECT",
      entity: "Application",
      entityId: applicationId,
      description: "Application rejected by owner",
    },
  });

  return updated;
};

const cancelApplication = async (applicationId: string, tenantId: string) => {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, deletedAt: null },
  });

  if (!application) {
    throw new AppError(httpStatus.NOT_FOUND, "Application not found");
  }

  if (application.tenantId !== tenantId) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only cancel your own application");
  }

  if (application.status !== "PENDING" && application.status !== "UNDER_REVIEW") {
    throw new AppError(httpStatus.BAD_REQUEST, `Cannot cancel an application with status ${application.status}`);
  }

  return prisma.application.update({
    where: { id: applicationId },
    data: { status: "CANCELLED" },
  });
};

export const ApplicationService = {
  createApplication,
  getAllApplications,
  getMyApplications,
  getOwnerApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  cancelApplication,
};