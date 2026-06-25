import { z } from "zod";
import { objectId } from "../../core/utils/validation";

export const createInteractionSchema = z.object({
  type: z.enum(["call", "email", "meeting", "note", "tour", "other"]),
  notes: z.string().optional(),
  outcome: z.string().optional(),
});

export const updateInteractionSchema = z.object({
  type: z.enum(["call", "email", "meeting", "note", "tour", "other"]).optional(),
  notes: z.string().optional(),
  outcome: z.string().optional(),
});

export const interactionLeadParamSchema = z.object({
  leadId: objectId,
});

export const interactionIdParamSchema = z.object({
  id: objectId,
});
