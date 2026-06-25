import { Router } from "express";
import { ReviewsController } from "./reviews.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { createReviewSchema, updateReviewSchema, reviewPropertyParamSchema, reviewIdParamSchema } from "./reviews.validation";

const reviewsRouter = Router();

reviewsRouter.get("/properties/:propertyId/reviews", validate(reviewPropertyParamSchema, "params"), ReviewsController.listByProperty);
reviewsRouter.post("/properties/:propertyId/reviews", requireAuth, validate(createReviewSchema), validate(reviewPropertyParamSchema, "params"), ReviewsController.create);
reviewsRouter.patch("/reviews/:id", requireAuth, validate(updateReviewSchema), validate(reviewIdParamSchema, "params"), ReviewsController.update);
reviewsRouter.delete("/reviews/:id", requireAuth, validate(reviewIdParamSchema, "params"), ReviewsController.delete);

export { reviewsRouter };
