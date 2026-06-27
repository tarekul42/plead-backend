import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().regex(/^\+?[\d\s\-().]{7,20}$/, "Invalid phone number").optional(),
  title: z.string().optional(),
});
