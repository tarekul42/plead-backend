import { NewsletterModel } from "./newsletter.model";
import { AppError } from "../../core/utils/app-error";

export const NewsletterService = {
  async subscribe(email: string) {
    const existing = await NewsletterModel.findOne({ email });
    if (existing) {
      if (existing.status === "active") {
        throw new AppError(409, "ALREADY_SUBSCRIBED", "Email is already subscribed");
      }
      existing.status = "active";
      existing.subscribedAt = new Date();
      existing.unsubscribedAt = undefined;
      return existing.save();
    }
    return NewsletterModel.create({ email });
  },
};
