import { RentalType } from "../../../generated/prisma/enums";

export interface ICreateApplicationPayload {
  flatId: string;
  roomId?: string;
  rentalType: RentalType;
  message?: string;
}

export interface IApplicationFilters {
  status?: string;
  rentalType?: string;
  flatId?: string;
}