export interface PropertyResponse {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  location: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  images: string[];
  beds: number;
  baths: number;
  area: number;
  propertyType: string;
  status: string;
  features: string[];
  assignedAgentId: string;
  views: number;
  inquiriesCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyListResponse {
  data: PropertyResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
