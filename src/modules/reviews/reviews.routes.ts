import { Router } from "express";
import { ReviewsController } from "./reviews.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { createReviewSchema, updateReviewSchema } from "./reviews.validation";

const reviewsRouter = Router();

reviewsRouter.get("/properties/:propertyId/reviews", ReviewsController.listByProperty);
reviewsRouter.post("/properties/:propertyId/reviews", requireAuth, validate(createReviewSchema), ReviewsController.create);
reviewsRouter.patch("/reviews/:id", requireAuth, validate(updateReviewSchema), ReviewsController.update);
reviewsRouter.delete("/reviews/:id", requireAuth, ReviewsController.delete);

export { reviewsRouter };
