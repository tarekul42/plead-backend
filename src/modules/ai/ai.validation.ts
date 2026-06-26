import { z } from "zod";
import { objectId } from "../../core/utils/validation";

export const matchLeadPropertiesSchema = z.object({
  leadId: objectId,
  propertyIds: z.array(objectId).optional(),
});

export const generatePropertyDescriptionSchema = z.object({
  propertyId: objectId,
  tone: z.enum(["luxury", "standard", "brief"]),
});

export const generateOutreachEmailSchema = z.object({
  leadId: objectId,
  propertyId: objectId,
  tone: z.enum(["professional", "friendly", "urgent"]),
});
