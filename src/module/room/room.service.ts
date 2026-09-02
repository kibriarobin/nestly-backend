import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type {
  ICreateRoomPayload,
  IUpdateRoomPayload,
  IRoomFilters,
} from "./room.interface";

const createRoom = async (ownerId: string, payload: ICreateRoomPayload) => {
  const flat = await prisma.flat.findFirst({
    where: { id: payload.flatId, deletedAt: null },
    include: { property: true },
  });

  if (!flat) {
    throw new AppError(httpStatus.NOT_FOUND, "Flat not found");
  }

  if (flat.property.ownerId !== ownerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only add rooms to your own flat",
    );
  }

  const room = await prisma.room.create({
    data: {
      flatId: payload.flatId,
      name: payload.name,
      rent: payload.rent,
      description: payload.description,
    },
  });

  return room;
};

const getAllRooms = async (
  filters: IRoomFilters & { onlyApproved?: boolean },
  options: { page: number; limit: number },
) => {
  const { flatId, status, searchTerm, onlyApproved } = filters;
  const { page, limit } = options;

  const andConditions: any[] = [
    { deletedAt: null },
    { flat: { deletedAt: null, property: { deletedAt: null } } },
  ];

  if (onlyApproved) {
    andConditions.push({ flat: { property: { status: "APPROVED" } } });
  }

  if (flatId) andConditions.push({ flatId });
  if (status) andConditions.push({ status });
  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  const whereConditions = { AND: andConditions };

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where: whereConditions,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        flat: {
          select: {
            id: true,
            name: true,
            property: { select: { id: true, title: true, city: true } },
          },
        },
      },
    }),
    prisma.room.count({ where: whereConditions }),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: rooms,
  };
};

const getRoomById = async (id: string) => {
  const room = await prisma.room.findFirst({
    where: { id, deletedAt: null },
    include: {
      flat: {
        include: {
          property: {
            select: { id: true, title: true, city: true, ownerId: true },
          },
        },
      },
    },
  });

  if (!room) {
    throw new AppError(httpStatus.NOT_FOUND, "Room not found");
  }

  return room;
};

const getMyRooms = async (ownerId: string) => {
  return prisma.room.findMany({
    where: { flat: { property: { ownerId } }, deletedAt: null },
    include: { flat: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
};

const updateRoom = async (
  id: string,
  ownerId: string,
  payload: IUpdateRoomPayload,
) => {
  const room = await prisma.room.findFirst({
    where: { id, deletedAt: null },
    include: { flat: { include: { property: true } } },
  });

  if (!room) {
    throw new AppError(httpStatus.NOT_FOUND, "Room not found");
  }

  if (room.flat.property.ownerId !== ownerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update rooms in your own property",
    );
  }

  const updated = await prisma.room.update({
    where: { id },
    data: payload,
  });

  return updated;
};

const deleteRoom = async (id: string, ownerId: string) => {
  const room = await prisma.room.findFirst({
    where: { id, deletedAt: null },
    include: { flat: { include: { property: true } } },
  });

  if (!room) {
    throw new AppError(httpStatus.NOT_FOUND, "Room not found");
  }

  if (room.flat.property.ownerId !== ownerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only delete rooms in your own property",
    );
  }

  if (room.status === "OCCUPIED" || room.status === "RESERVED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete a room that is occupied or reserved",
    );
  }

  const deleted = await prisma.room.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return deleted;
};

export const RoomService = {
  createRoom,
  getAllRooms,
  getRoomById,
  getMyRooms,
  updateRoom,
  deleteRoom,
};
