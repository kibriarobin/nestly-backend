export interface ICreateReviewPayload {
  propertyId: string;
  flatId?: string;
  rating: number;
  comment?: string;
}

export interface IUpdateReviewPayload {
  rating?: number;
  comment?: string;
}
