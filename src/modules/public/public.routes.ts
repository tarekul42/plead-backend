import { Router } from "express";
import { PublicController } from "./public.controller";

const publicRouter = Router();

publicRouter.get("/stats", PublicController.stats);
publicRouter.get("/testimonials", PublicController.testimonials);
publicRouter.get("/faq", PublicController.faq);

export { publicRouter };
