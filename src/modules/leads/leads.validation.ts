import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  budget: z.number().min(0).optional(),
  preferredLocation: z.string().optional(),
  propertyType: z.string().optional(),
  bedsDesired: z.number().min(0).optional(),
  bathsDesired: z.number().min(0).optional(),
  notes: z.string().optional(),
  status: z.enum(["new", "contacted", "qualified", "negotiating", "closed", "lost"]).optional(),
  source: z.string().optional(),
  assignedAgentId: z.string(),
});

export const updateLeadSchema = createLeadSchema.partial();
