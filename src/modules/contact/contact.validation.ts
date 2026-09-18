import { z } from "zod";
import { objectId } from "../../core/utils/validation";

export const createContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  propertyId: objectId.optional(),
});
