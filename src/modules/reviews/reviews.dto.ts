export interface ReviewResponse {
  _id: string;
  propertyId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
