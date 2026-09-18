import { Router } from "express";
import { FavoritesController } from "./favorites.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { addFavoriteSchema, favoriteParamSchema } from "./favorites.validation";

const favoritesRouter = Router();

favoritesRouter.use(requireAuth);

favoritesRouter.get("/", FavoritesController.list);
favoritesRouter.post("/", validate(addFavoriteSchema), FavoritesController.add);
favoritesRouter.delete(
  "/:propertyId",
  validate(favoriteParamSchema, "params"),
  FavoritesController.remove,
);
favoritesRouter.get(
  "/check/:propertyId",
  validate(favoriteParamSchema, "params"),
  FavoritesController.check,
);

export { favoritesRouter };
