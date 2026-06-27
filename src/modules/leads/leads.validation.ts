import { z } from "zod";
import { objectId } from "../../core/utils/validation";

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
  assignedAgentId: objectId,
});

export const updateLeadSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  budget: z.number().min(0).optional(),
  preferredLocation: z.string().optional(),
  propertyType: z.string().optional(),
  bedsDesired: z.number().min(0).optional(),
  bathsDesired: z.number().min(0).optional(),
  notes: z.string().optional(),
  status: z.enum(["new", "contacted", "qualified", "negotiating", "closed", "lost"]).optional(),
  source: z.string().optional(),
  assignedAgentId: objectId.optional(),
});

export const listLeadsQuerySchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "negotiating", "closed", "lost"]).optional(),
  assignedAgentId: objectId.optional(),
  q: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export const leadParamSchema = z.object({
  id: objectId,
});
