import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
});

export const updateReviewSchema = createReviewSchema.partial();
