import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { ICreatePropertyPayload, IUpdatePropertyPayload, IPropertyFilters } from "./property.interface";

const createProperty = async (ownerId: string, payload: ICreatePropertyPayload) => {
  const property = await prisma.property.create({
    data: {
      ownerId,
      title: payload.title,
      address: payload.address,
      city: payload.city,
      description: payload.description,
    },
  });

  return property;
};

const getAllProperties = async (
  filters: IPropertyFilters,
  options: { page: number; limit: number },
) => {
  const { city, status, searchTerm } = filters;
  const { page, limit } = options;

  const andConditions: any[] = [{ deletedAt: null }];

  if (status) {
    andConditions.push({ status });
  }

  if (city) {
    andConditions.push({ city: { equals: city, mode: "insensitive" } });
  }

  if (searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { address: { contains: searchTerm, mode: "insensitive" } },
        { city: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  const whereConditions = { AND: andConditions };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where: whereConditions,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.property.count({ where: whereConditions }),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: properties,
  };
};

const getPropertyById = async (id: string) => {
  const property = await prisma.property.findFirst({
    where: { id, deletedAt: null },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      flats: { where: { deletedAt: null } },
    },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  return property;
};

const getMyProperties = async (ownerId: string) => {
  return prisma.property.findMany({
    where: { ownerId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
};

const updateProperty = async (
  id: string,
  ownerId: string,
  payload: IUpdatePropertyPayload,
) => {
  const property = await prisma.property.findFirst({
    where: { id, deletedAt: null },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  if (property.ownerId !== ownerId) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only update your own property");
  }

  const updated = await prisma.property.update({
    where: { id },
    data: payload,
  });

  return updated;
};

const deleteProperty = async (id: string, ownerId: string) => {
  const property = await prisma.property.findFirst({
    where: { id, deletedAt: null },
    include: {
      flats: {
        where: { deletedAt: null },
        include: { bookings: { where: { status: { in: ["PENDING", "CONFIRMED"] } } } },
      },
    },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  if (property.ownerId !== ownerId) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only delete your own property");
  }

  const hasActiveBooking = property.flats.some((flat) => flat.bookings.length > 0);
  if (hasActiveBooking) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete a property with active bookings",
    );
  }

  const deleted = await prisma.property.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return deleted;
};

// Admin only
const updatePropertyStatus = async (id: string, status: "APPROVED" | "REJECTED" | "SUSPENDED") => {
  const property = await prisma.property.findFirst({
    where: { id, deletedAt: null },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  const updated = await prisma.property.update({
    where: { id },
    data: { status },
  });

  return updated;
};

export const PropertyService = {
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
};