import { AvailabilityStatus } from "../../../generated/prisma/enums";

export interface ICreateFlatPayload {
  propertyId: string;
  name: string;
  floor?: number;
  rent?: number;
  description?: string;
}

export interface IUpdateFlatPayload {
  name?: string;
  floor?: number;
  rent?: number;
  description?: string;
  status?: AvailabilityStatus;
}

export interface IFlatFilters {
  propertyId?: string;
  status?: AvailabilityStatus;
  city?: string;
  searchTerm?: string;
}