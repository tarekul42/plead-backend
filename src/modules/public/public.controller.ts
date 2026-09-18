import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { PropertyModel } from "../properties/properties.model";
import { LeadModel } from "../leads/leads.model";
import { AiGeneratedCopyModel } from "../ai/models/ai-copy.model";
import { TestimonialModel } from "../testimonials/testimonials.model";
import { FAQModel } from "../faq/faq.model";

export const PublicController = {
  stats: asyncHandler(async (_req: Request, res: Response) => {
    const [propertiesListed, leadsTracked, aiMatchesMade] = await Promise.all([
      PropertyModel.countDocuments(),
      LeadModel.countDocuments(),
      AiGeneratedCopyModel.countDocuments({ type: "match" }),
    ]);

    res.json(
      success({
        propertiesListed,
        leadsTracked,
        aiMatchesMade,
        avgCloseTimeReduction: 52,
      }),
    );
  }),

  testimonials: asyncHandler(async (_req: Request, res: Response) => {
    const testimonials = await TestimonialModel.find({ featured: true })
      .sort({ sortOrder: 1 })
      .lean();
    res.json(success(testimonials));
  }),

  faq: asyncHandler(async (_req: Request, res: Response) => {
    const faq = await FAQModel.find().sort({ sortOrder: 1 }).lean();
    res.json(success(faq));
  }),
};
