import { z } from "zod";

export const createInteractionSchema = z.object({
  type: z.enum(["call", "email", "meeting", "note", "tour", "other"]),
  notes: z.string().optional(),
  outcome: z.string().optional(),
});

export const updateInteractionSchema = createInteractionSchema.partial();
