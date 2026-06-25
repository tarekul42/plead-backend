import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

export const objectIdParam = z.object({
  id: objectId,
});

export const objectIdOptional = objectId.optional();
