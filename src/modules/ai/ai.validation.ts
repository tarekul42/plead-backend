import { z } from "zod";

export const matchLeadPropertiesSchema = z.object({
  leadId: z.string(),
  propertyIds: z.array(z.string()).optional(),
});

export const generatePropertyDescriptionSchema = z.object({
  propertyId: z.string(),
  tone: z.enum(["luxury", "standard", "brief"]),
});

export const generateOutreachEmailSchema = z.object({
  leadId: z.string(),
  propertyId: z.string(),
  tone: z.enum(["professional", "friendly", "urgent"]),
});
