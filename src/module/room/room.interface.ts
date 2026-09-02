import { AvailabilityStatus } from "../../../generated/prisma/enums";

export interface ICreateRoomPayload {
  flatId: string;
  name: string;
  rent: number;
  description?: string;
}

export interface IUpdateRoomPayload {
  name?: string;
  rent?: number;
  description?: string;
  status?: AvailabilityStatus;
}

export interface IRoomFilters {
  flatId?: string;
  status?: AvailabilityStatus;
  searchTerm?: string;
}
