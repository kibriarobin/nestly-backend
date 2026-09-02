import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type {
  ICreateFlatPayload,
  IUpdateFlatPayload,
  IFlatFilters,
} from "./flat.interface";

const createFlat = async (ownerId: string, payload: ICreateFlatPayload) => {
  const property = await prisma.property.findFirst({
    where: { id: payload.propertyId, deletedAt: null },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  if (property.ownerId !== ownerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only add flats to your own property",
    );
  }

  const flat = await prisma.flat.create({
    data: {
      propertyId: payload.propertyId,
      name: payload.name,
      floor: payload.floor,
      rent: payload.rent,
      description: payload.description,
    },
  });

  return flat;
};

const getAllFlats = async (
  filters: IFlatFilters & { onlyApproved?: boolean },
  options: { page: number; limit: number },
) => {
  const { propertyId, status, city, searchTerm, onlyApproved } = filters;
  const { page, limit } = options;

  const andConditions: any[] = [
    { deletedAt: null },
    { property: { deletedAt: null } },
  ];

  if (onlyApproved) {
    andConditions.push({ property: { status: "APPROVED" } });
  }

  if (propertyId) andConditions.push({ propertyId });
  if (status) andConditions.push({ status });
  if (city)
    andConditions.push({
      property: { city: { equals: city, mode: "insensitive" } },
    });
  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  const whereConditions = { AND: andConditions };

  const [flats, total] = await Promise.all([
    prisma.flat.findMany({
      where: whereConditions,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: { id: true, title: true, city: true, status: true },
        },
      },
    }),
    prisma.flat.count({ where: whereConditions }),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: flats,
  };
};

const getFlatById = async (id: string) => {
  const flat = await prisma.flat.findFirst({
    where: { id, deletedAt: null },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          city: true,
          ownerId: true,
          status: true,
        },
      },
      rooms: { where: { deletedAt: null } },
    },
  });

  if (!flat) {
    throw new AppError(httpStatus.NOT_FOUND, "Flat not found");
  }

  return flat;
};

const getMyFlats = async (ownerId: string) => {
  return prisma.flat.findMany({
    where: { property: { ownerId }, deletedAt: null },
    include: { property: { select: { id: true, title: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });
};

const updateFlat = async (
  id: string,
  ownerId: string,
  payload: IUpdateFlatPayload,
) => {
  const flat = await prisma.flat.findFirst({
    where: { id, deletedAt: null },
    include: { property: true },
  });

  if (!flat) {
    throw new AppError(httpStatus.NOT_FOUND, "Flat not found");
  }

  if (flat.property.ownerId !== ownerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update flats in your own property",
    );
  }

  const updated = await prisma.flat.update({
    where: { id },
    data: payload,
  });

  return updated;
};

const deleteFlat = async (id: string, ownerId: string) => {
  const flat = await prisma.flat.findFirst({
    where: { id, deletedAt: null },
    include: {
      property: true,
      rooms: { where: { deletedAt: null } },
    },
  });

  if (!flat) {
    throw new AppError(httpStatus.NOT_FOUND, "Flat not found");
  }

  if (flat.property.ownerId !== ownerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only delete flats in your own property",
    );
  }

  if (flat.status === "OCCUPIED" || flat.status === "RESERVED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete a flat that is occupied or reserved",
    );
  }

  const deleted = await prisma.flat.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return deleted;
};

export const FlatService = {
  createFlat,
  getAllFlats,
  getFlatById,
  getMyFlats,
  updateFlat,
  deleteFlat,
};
