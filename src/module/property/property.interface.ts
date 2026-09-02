export interface ICreatePropertyPayload {
  title: string;
  address: string;
  city: string;
  description?: string;
}

export interface IUpdatePropertyPayload {
  title?: string;
  address?: string;
  city?: string;
  description?: string;
}

export interface IPropertyFilters {
  city?: string;
  status?: string;
  searchTerm?: string;
}