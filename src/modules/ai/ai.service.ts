import mongoose from "mongoose";
import { callAIWithFallback } from "./providers/provider.factory";
import { AiRepository } from "./ai.repository";
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
    let aiResult: { data: unknown; tokensUsed: number; provider: string };
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
      await AiRepository.persistAnalysis({
        agencyId: new mongoose.Types.ObjectId(agencyId),
        userId: new mongoose.Types.ObjectId(userId),
        type: "lead-matching",
        input: { leadId, propertyIds: properties.map((p) => p._id.toString()) },
        output: {},
        provider: "",
        tokensUsed: 0,
        durationMs: Date.now() - start,
        success: false,
        errorMessage: getErrorMessage(err),
      });
      throw err;
    }
    const { data, tokensUsed, provider } = aiResult;
    const result = (data as { matches: unknown[] }) || { matches: [] };
    const durationMs = Date.now() - start;

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
    let aiResult: { data: unknown; tokensUsed: number; provider: string };
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
      await AiRepository.persistAnalysis({
        agencyId: new mongoose.Types.ObjectId(agencyId),
        userId: new mongoose.Types.ObjectId(userId),
        type: "property-description",
        input: { propertyId, tone },
        output: {},
        provider: "",
        tokensUsed: 0,
        durationMs: Date.now() - start,
        success: false,
        errorMessage: getErrorMessage(err),
      });
      throw err;
    }
    const { data, tokensUsed, provider } = aiResult;
    const result = (data as { title: string; description: string; highlights: string[] }) || {};
    const durationMs = Date.now() - start;

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
    let aiResult: { data: unknown; tokensUsed: number; provider: string };
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
      await AiRepository.persistAnalysis({
        agencyId: new mongoose.Types.ObjectId(agencyId),
        userId: new mongoose.Types.ObjectId(userId),
        type: "outreach-email",
        input: { leadId, propertyId, tone },
        output: {},
        provider: "",
        tokensUsed: 0,
        durationMs: Date.now() - start,
        success: false,
        errorMessage: getErrorMessage(err),
      });
      throw err;
    }
    const { data, tokensUsed, provider } = aiResult;
    const result = (data as { subject: string; body: string }) || {};
    const durationMs = Date.now() - start;

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
};
