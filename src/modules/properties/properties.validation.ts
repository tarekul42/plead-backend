import { z } from "zod";

export const createPropertySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  price: z.number().min(0),
  location: z.string().min(1),
  address: z.string().optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  images: z.array(z.string()).min(1),
  beds: z.number().min(0).max(100),
  baths: z.number().min(0).max(100),
  area: z.number().min(0),
  propertyType: z.enum(["house", "apartment", "condo", "townhouse", "land", "commercial"]),
  status: z.enum(["available", "sold", "rented", "pending"]).optional(),
  features: z.array(z.string()).optional(),
  assignedAgentId: z.string(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const listPropertiesQuerySchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  propertyType: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  beds: z.coerce.number().optional(),
  status: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(12),
});
