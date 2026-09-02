import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { RoomController } from "./room.controller";
import { RoomValidation } from "./room.validation";

const router = Router();

router.post(
  "/",
  auth(UserRole.OWNER),
  validateRequest(RoomValidation.createRoomValidationSchema),
  RoomController.createRoom,
);

router.get("/my-rooms", auth(UserRole.OWNER), RoomController.getMyRooms);

router.get("/", RoomController.getAllRooms);

router.get("/:roomId", RoomController.getRoomById);

router.patch(
  "/:roomId",
  auth(UserRole.OWNER),
  validateRequest(RoomValidation.updateRoomValidationSchema),
  RoomController.updateRoom,
);

router.delete("/:roomId", auth(UserRole.OWNER), RoomController.deleteRoom);

export const RoomRoutes = router;
