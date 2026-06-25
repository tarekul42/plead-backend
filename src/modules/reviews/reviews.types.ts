export type Review = {
  _id: string;
  propertyId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
};
