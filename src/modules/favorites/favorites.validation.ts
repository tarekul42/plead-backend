import { z } from "zod";
import { objectId } from "../../core/utils/validation";

export const addFavoriteSchema = z.object({
  propertyId: objectId,
});

export const favoriteParamSchema = z.object({
  propertyId: objectId,
});
