import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { IUserFilters } from "./admin.interface";

const getAllUsers = async (
  filters: IUserFilters,
  options: { page: number; limit: number },
) => {
  const { role, status, searchTerm } = filters;
  const { page, limit } = options;

  const andConditions: any[] = [{ deletedAt: null }];

  if (role) andConditions.push({ role });
  if (status) andConditions.push({ status });
  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  const whereConditions = { AND: andConditions };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereConditions,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where: whereConditions }),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: users,
  };
};

const updateUserStatus = async (
  adminId: string,
  targetUserId: string,
  status: "ACTIVE" | "BLOCKED",
) => {
  const user = await prisma.user.findFirst({
    where: { id: targetUserId, deletedAt: null },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.role === "ADMIN") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot change status of an admin account",
    );
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { status },
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: status === "BLOCKED" ? "BLOCK" : "UNBLOCK",
      entity: "User",
      entityId: targetUserId,
      description: `User ${status === "BLOCKED" ? "blocked" : "unblocked"} by admin`,
    },
  });

  return updated;
};

const getDashboardStats = async () => {
  const [
    totalUsers,
    totalOwners,
    totalTenants,
    totalProperties,
    approvedProperties,
    pendingProperties,
    totalFlats,
    totalRooms,
    activeBookings,
    completedBookings,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: "OWNER", deletedAt: null } }),
    prisma.user.count({ where: { role: "TENANT", deletedAt: null } }),
    prisma.property.count({ where: { deletedAt: null } }),
    prisma.property.count({ where: { status: "APPROVED", deletedAt: null } }),
    prisma.property.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.flat.count({ where: { deletedAt: null } }),
    prisma.room.count({ where: { deletedAt: null } }),
    prisma.booking.count({
      where: { status: { in: ["PENDING", "CONFIRMED"] }, deletedAt: null },
    }),
    prisma.booking.count({ where: { status: "COMPLETED", deletedAt: null } }),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
  ]);

  return {
    users: { total: totalUsers, owners: totalOwners, tenants: totalTenants },
    properties: {
      total: totalProperties,
      approved: approvedProperties,
      pending: pendingProperties,
    },
    flats: totalFlats,
    rooms: totalRooms,
    bookings: { active: activeBookings, completed: completedBookings },
    revenue: totalRevenue._sum.amount ?? 0,
  };
};

const getOwnerPropertyStats = async () => {
  const owners = await prisma.user.findMany({
    where: { role: "OWNER", deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      _count: { select: { properties: true } },
    },
  });

  return owners.map((owner) => ({
    ownerId: owner.id,
    name: owner.name,
    email: owner.email,
    propertyCount: owner._count.properties,
  }));
};

const getAuditLogs = async (options: { page: number; limit: number }) => {
  const { page, limit } = options;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
    prisma.auditLog.count(),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: logs,
  };
};

export const AdminService = {
  getAllUsers,
  updateUserStatus,
  getDashboardStats,
  getOwnerPropertyStats,
  getAuditLogs,
};
