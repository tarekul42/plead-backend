import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
});
