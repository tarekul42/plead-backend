import { z } from "zod";
import { objectId } from "../../core/utils/validation";

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
  assignedAgentId: objectId,
});

export const updatePropertySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  price: z.number().min(0).optional(),
  location: z.string().min(1).optional(),
  address: z.string().optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  images: z.array(z.string()).optional(),
  beds: z.number().min(0).max(100).optional(),
  baths: z.number().min(0).max(100).optional(),
  area: z.number().min(0).optional(),
  propertyType: z.enum(["house", "apartment", "condo", "townhouse", "land", "commercial"]).optional(),
  status: z.enum(["available", "sold", "rented", "pending"]).optional(),
  features: z.array(z.string()).optional(),
  assignedAgentId: objectId.optional(),
});

export const propertyParamSchema = z.object({
  id: objectId,
});

export const propertySlugParamSchema = z.object({
  slug: z.string().min(1),
});

export const listPropertiesQuerySchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  propertyType: z.enum(["house", "apartment", "condo", "townhouse", "land", "commercial"]).optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  beds: z.coerce.number().optional(),
  status: z.enum(["available", "sold", "rented", "pending"]).optional(),
  sort: z.enum(["newest", "oldest", "price-asc", "price-desc"]).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(12),
});
