import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { pick } from "../../utils/pick";
import { RoomService } from "./room.service";
import { Request, Response } from "express";

const createRoom = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.createRoom(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Room created successfully",
    data: result,
  });
});

const getAllRooms = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["flatId", "status", "searchTerm"]);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const onlyApproved = req.user?.role !== "ADMIN" && req.user?.role !== "OWNER";

  const result = await RoomService.getAllRooms(
    { ...filters, onlyApproved },
    { page, limit },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rooms retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMyRooms = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.getMyRooms(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your rooms retrieved successfully",
    data: result,
  });
});

const getRoomById = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.getRoomById(req.params.roomId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Room retrieved successfully",
    data: result,
  });
});

const updateRoom = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.updateRoom(
    req.params.roomId as string,
    req.user!.userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Room updated successfully",
    data: result,
  });
});

const deleteRoom = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.deleteRoom(
    req.params.roomId as string,
    req.user!.userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Room deleted successfully",
    data: result,
  });
});

export const RoomController = {
  createRoom,
  getAllRooms,
  getMyRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
};
