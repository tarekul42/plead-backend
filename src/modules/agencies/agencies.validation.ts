import { z } from "zod";
import { objectId } from "../../core/utils/validation";

export const createAgencySchema = z.object({
  name: z.string().min(1).max(200),
  logoUrl: z.string().optional(),
  plan: z.enum(["free", "pro", "enterprise"]).optional(),
});

export const updateAgencySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  logoUrl: z.string().optional(),
  plan: z.enum(["free", "pro", "enterprise"]).optional(),
});

export const agencyParamSchema = z.object({
  id: objectId,
});
