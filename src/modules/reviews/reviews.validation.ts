import { z } from "zod";
import { objectId } from "../../core/utils/validation";

export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  title: z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
  isVerified: z.boolean().optional(),
});

export const reviewPropertyParamSchema = z.object({
  propertyId: objectId,
});

export const reviewIdParamSchema = z.object({
  id: objectId,
});
