import { Router } from "express";
import { ReviewsController } from "./reviews.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { StrictRole } from "../../core/middleware/rbac.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import {
  createReviewSchema,
  updateReviewSchema,
  reviewPropertyParamSchema,
  reviewIdParamSchema,
} from "./reviews.validation";

const reviewsRouter = Router();

reviewsRouter.get("/reviews", requireAuth, ReviewsController.list);
reviewsRouter.get(
  "/properties/:propertyId/reviews",
  requireAuth,
  validate(reviewPropertyParamSchema, "params"),
  ReviewsController.listByProperty,
);
reviewsRouter.post(
  "/properties/:propertyId/reviews",
  requireAuth,
  StrictRole("agent", "manager", "admin"),
  validate(createReviewSchema),
  validate(reviewPropertyParamSchema, "params"),
  ReviewsController.create,
);
reviewsRouter.patch(
  "/reviews/:id",
  requireAuth,
  StrictRole("manager", "admin"),
  validate(updateReviewSchema),
  validate(reviewIdParamSchema, "params"),
  ReviewsController.update,
);
reviewsRouter.delete(
  "/reviews/:id",
  requireAuth,
  StrictRole("manager", "admin"),
  validate(reviewIdParamSchema, "params"),
  ReviewsController.delete,
);

export { reviewsRouter };
