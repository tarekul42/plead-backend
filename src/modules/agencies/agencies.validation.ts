import { z } from "zod";

export const createAgencySchema = z.object({
  name: z.string().min(1).max(200),
  logoUrl: z.string().optional(),
  plan: z.enum(["free", "pro", "enterprise"]).optional(),
});

export const updateAgencySchema = createAgencySchema.partial();
