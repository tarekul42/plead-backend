import mongoose from "mongoose";
import { callAIWithFallback } from "./providers/provider.factory";
import { AiRepository } from "./ai.repository";
import { AiAnalysisModel } from "./models/ai-analysis.model";
import { PropertyModel } from "../properties/properties.model";
import { LeadModel } from "../leads/leads.model";
import { cacheGet, cacheSet } from "../../core/utils/cache";
import { hashInput } from "../../core/utils/hash";
import { env } from "../../core/config/env";
import { NotFoundError } from "../../core/utils/app-error";
import {
  buildMatchEngineUserPrompt,
  matchEngineSystemPrompt,
  matchEngineResponseSchema,
} from "./prompts/match-engine.prompts";
import {
  buildPropertyDescriptionUserPrompt,
  propertyDescriptionSystemPrompt,
  propertyDescriptionResponseSchema,
} from "./prompts/property-description.prompts";
import {
  buildOutreachEmailUserPrompt,
  outreachEmailSystemPrompt,
  outreachEmailResponseSchema,
} from "./prompts/outreach-email.prompts";
import { logger } from "../../core/utils/logger";
import { getErrorMessage } from "../../core/utils/safe-error";

export const AiService = {
  async matchLeadProperties(leadId: string, propertyIds: string[] | undefined, userId: string, agencyId: string) {
    const lead = await LeadModel.findOne({ _id: leadId, agencyId }).lean();
    if (!lead) throw NotFoundError("Lead");

    const filter: Record<string, unknown> = { agencyId, status: "available" };
    if (propertyIds && propertyIds.length > 0) {
      filter._id = { $in: propertyIds };
    }
    const properties = await PropertyModel.find(filter).lean();
    if (properties.length === 0) return { matches: [], provider: "", tokensUsed: 0, cached: false };

    const inputHash = hashInput({ leadId, propertyIds: properties.map((p) => p._id) });
    const cached = await cacheGet<{ matches: unknown[] }>(inputHash);
    if (cached) return { ...cached, cached: true };

    const start = Date.now();
    let aiResult: { data: unknown; tokensUsed: number; provider: string } | null = null;
    try {
      aiResult = await callAIWithFallback({
        system: matchEngineSystemPrompt,
        user: buildMatchEngineUserPrompt(
          {
            budget: lead.budget,
            preferredLocation: lead.preferredLocation,
            bedsDesired: lead.bedsDesired,
            bathsDesired: lead.bathsDesired,
            propertyType: lead.propertyType,
            notes: lead.notes,
          },
          properties.map((p) => ({
            _id: p._id.toString(),
            title: p.title,
            price: p.price,
            location: p.location,
            beds: p.beds,
            baths: p.baths,
            area: p.area,
            propertyType: p.propertyType,
            features: p.features,
          })),
        ),
        schema: matchEngineResponseSchema,
        temperature: 0.3,
      });
    } catch (err) {
      logger.warn({ err }, "AI matching failed, using rule-based fallback");
    }
    const durationMs = Date.now() - start;

    let result: { matches: unknown[] };
    let tokensUsed = 0;
    let provider = "";

    if (aiResult) {
      const { data: aiData, tokensUsed: aiTokens, provider: aiProvider } = aiResult;
      result = (aiData as { matches: unknown[] }) || { matches: [] };
      tokensUsed = aiTokens;
      provider = aiProvider;
    } else {
      const scored = properties
        .map((p) => {
          let score = 50;
          const reasons: string[] = [];
          if (lead.budget && p.price <= lead.budget * 1.1) {
            score += 15;
            reasons.push("Within budget range");
          } else if (lead.budget) {
            score -= 10;
            reasons.push("Above budget");
          }
          if (lead.preferredLocation && p.location.toLowerCase().includes(lead.preferredLocation.toLowerCase())) {
            score += 20;
            reasons.push("Matches preferred location");
          }
          if (lead.bedsDesired !== undefined && p.beds >= lead.bedsDesired) {
            score += 10;
            reasons.push("Meets bedroom requirements");
          } else if (lead.bedsDesired !== undefined) {
            score -= 5;
          }
          if (lead.propertyType && p.propertyType === lead.propertyType) {
            score += 10;
            reasons.push("Matches property type");
          }
          return { propertyId: p._id.toString(), propertyTitle: p.title, propertyLocation: p.location, score: Math.min(100, Math.max(0, score)), reasons: reasons.length > 0 ? reasons : ["Available property"] };
        })
        .filter((m) => m.score >= 40)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      result = { matches: scored };
    }

    const ttlMs = env.AI_CACHE_TTL_HOURS * 60 * 60 * 1000;

    await AiRepository.persistAnalysis({
      agencyId: new mongoose.Types.ObjectId(agencyId),
      userId: new mongoose.Types.ObjectId(userId),
      type: "lead-matching",
      input: { leadId, propertyIds: properties.map((p) => p._id.toString()) },
      output: result,
      provider,
      tokensUsed,
      durationMs,
      success: true,
    });

    await cacheSet(inputHash, result, ttlMs);

    return { ...result, provider, tokensUsed, cached: false };
  },

  async generatePropertyDescription(propertyId: string, tone: "luxury" | "standard" | "brief", userId: string, agencyId: string) {
    const property = await PropertyModel.findOne({ _id: propertyId, agencyId }).lean();
    if (!property) throw NotFoundError("Property");

    const inputHash = hashInput({ propertyId, tone });
    const cached = await cacheGet<{ title: string; description: string; highlights: string[] }>(inputHash);
    if (cached) return { ...cached, cached: true };

    const start = Date.now();
    let aiResult: { data: unknown; tokensUsed: number; provider: string } | null = null;
    try {
      aiResult = await callAIWithFallback({
        system: propertyDescriptionSystemPrompt,
        user: buildPropertyDescriptionUserPrompt(
          {
            title: property.title,
            price: property.price,
            location: property.location,
            beds: property.beds,
            baths: property.baths,
            area: property.area,
            propertyType: property.propertyType,
            features: property.features,
            description: property.description,
          },
          tone,
        ),
        schema: propertyDescriptionResponseSchema,
        temperature: 0.7,
      });
    } catch (err) {
      logger.warn({ err }, "AI description generation failed, using template fallback");
    }
    const durationMs = Date.now() - start;

    let result: { title: string; description: string; highlights: string[] };
    let tokensUsed = 0;
    let provider = "";

    if (aiResult) {
      const { data: aiData, tokensUsed: aiTokens, provider: aiProvider } = aiResult;
      result = (aiData as { title: string; description: string; highlights: string[] }) || { title: "", description: "", highlights: [] };
      tokensUsed = aiTokens;
      provider = aiProvider;
    } else {
      const templates: Record<string, { prefix: string }> = {
        luxury: { prefix: "Experience unparalleled luxury in this magnificent " },
        standard: { prefix: "Welcome to your new home — a beautiful " },
        brief: { prefix: "" },
      };
      const t = templates[tone] || templates.standard;
      result = {
        title: property.title,
        description: `${t.prefix}${property.propertyType} in ${property.location} featuring ${property.beds} bedrooms and ${property.baths} bathrooms across ${property.area} sq ft. ${property.features?.length ? `Highlights include: ${property.features.slice(0, 3).join(", ")}.` : ""} Priced at $${property.price.toLocaleString()}.`,
        highlights: property.features?.slice(0, 5) || [],
      };
    }

    const ttlMs = env.AI_CACHE_TTL_HOURS * 60 * 60 * 1000;

    await AiRepository.persistAnalysis({
      agencyId: new mongoose.Types.ObjectId(agencyId),
      userId: new mongoose.Types.ObjectId(userId),
      type: "property-description",
      input: { propertyId, tone },
      output: result,
      provider,
      tokensUsed,
      durationMs,
      success: true,
    });

    await AiRepository.persistCopy({

      agencyId: new mongoose.Types.ObjectId(agencyId),
      userId: new mongoose.Types.ObjectId(userId),
      type: "property-description",
      propertyId: new mongoose.Types.ObjectId(propertyId),
      tone,
      content: result.description || "",
    });

    await cacheSet(inputHash, result, ttlMs);

    return { ...result, provider, tokensUsed, cached: false };
  },

  async generateOutreachEmail(leadId: string, propertyId: string, tone: "professional" | "friendly" | "urgent", userId: string, agencyId: string) {
    const [lead, property] = await Promise.all([
      LeadModel.findOne({ _id: leadId, agencyId }).lean(),
      PropertyModel.findOne({ _id: propertyId, agencyId }).lean(),
    ]);
    if (!lead) throw NotFoundError("Lead");
    if (!property) throw NotFoundError("Property");

    const inputHash = hashInput({ leadId, propertyId, tone });
    const cached = await cacheGet<{ subject: string; body: string }>(inputHash);
    if (cached) return { ...cached, cached: true };

    const start = Date.now();
    let aiResult: { data: unknown; tokensUsed: number; provider: string } | null = null;
    try {
      aiResult = await callAIWithFallback({
        system: outreachEmailSystemPrompt,
        user: buildOutreachEmailUserPrompt(
          {
            name: lead.name,
            budget: lead.budget,
            preferredLocation: lead.preferredLocation,
            bedsDesired: lead.bedsDesired,
          },
          {
            title: property.title,
            price: property.price,
            location: property.location,
            beds: property.beds,
            baths: property.baths,
            area: property.area,
            propertyType: property.propertyType,
            features: property.features,
          },
          tone,
        ),
        schema: outreachEmailResponseSchema,
        temperature: 0.7,
      });
    } catch (err) {
      logger.warn({ err }, "AI outreach email generation failed, using template fallback");
    }
    const durationMs = Date.now() - start;

    let result: { subject: string; body: string };
    let tokensUsed = 0;
    let provider = "";

    if (aiResult) {
      const { data: aiData, tokensUsed: aiTokens, provider: aiProvider } = aiResult;
      result = (aiData as { subject: string; body: string }) || { subject: "", body: "" };
      tokensUsed = aiTokens;
      provider = aiProvider;
    } else {
      const toneIntro: Record<string, string> = {
        professional: "I hope this message finds you well.",
        friendly: "Hope you're having a great day!",
        urgent: "I wanted to reach out quickly regarding a fantastic opportunity.",
      };
      result = {
        subject: `Property Match: ${property.title} in ${property.location}`,
        body: `Hi ${lead.name},\n\n${toneIntro[tone] || toneIntro.professional}\n\nI came across a property that I think you'll love: ${property.title} located in ${property.location}, priced at $${property.price.toLocaleString()}. This ${property.propertyType} features ${property.beds} beds and ${property.baths} baths.\n\n${property.features?.length ? `Some highlights include: ${property.features.slice(0, 3).join(", ")}.\n\n` : ""}Would you like to schedule a tour or learn more?\n\nBest regards,\nYour Real Estate Team`,
      };
    }

    const ttlMs = env.AI_CACHE_TTL_HOURS * 60 * 60 * 1000;

    await AiRepository.persistAnalysis({
      agencyId: new mongoose.Types.ObjectId(agencyId),
      userId: new mongoose.Types.ObjectId(userId),
      type: "outreach-email",
      input: { leadId, propertyId, tone },
      output: result,
      provider,
      tokensUsed,
      durationMs,
      success: true,
    });

    await AiRepository.persistCopy({
      agencyId: new mongoose.Types.ObjectId(agencyId),
      userId: new mongoose.Types.ObjectId(userId),
      type: "outreach-email",
      propertyId: new mongoose.Types.ObjectId(propertyId),
      leadId: new mongoose.Types.ObjectId(leadId),
      tone,
      content: result.body || "",
    });

    await cacheSet(inputHash, result, ttlMs);

    return { ...result, provider, tokensUsed, cached: false };
  },

  async getUsage(agencyId: string, userId: string, role: string) {
    const filter: Record<string, unknown> = { agencyId: new mongoose.Types.ObjectId(agencyId) };
    if (role !== "admin" && role !== "manager") {
      filter.userId = new mongoose.Types.ObjectId(userId);
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [total, last30Days, byType, byDay, byProvider] = await Promise.all([
      AiAnalysisModel.countDocuments(filter),
      AiAnalysisModel.countDocuments({ ...filter, createdAt: { $gte: thirtyDaysAgo } }),
      AiAnalysisModel.aggregate([
        { $match: filter },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      AiAnalysisModel.aggregate([
        { $match: { ...filter, createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", count: 1 } },
      ]),
      AiAnalysisModel.aggregate([
        { $match: filter },
        { $group: { _id: "$provider", count: { $sum: 1 } } },
      ]),
    ]);

    const byTypeMap: Record<string, number> = {};
    for (const t of byType) byTypeMap[t._id] = t.count;

    const byProviderMap: Record<string, number> = {};
    for (const p of byProvider) byProviderMap[p._id] = p.count;

    return { total, last30Days, byType: byTypeMap, byDay, byProvider: byProviderMap };
  },
};
