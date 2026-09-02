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
  status?: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "MAINTENANCE" | "INACTIVE";
}

export interface IFlatFilters {
  propertyId?: string;
  status?: string;
  city?: string;
  searchTerm?: string;
}