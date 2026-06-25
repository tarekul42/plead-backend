import { callAIWithFallback } from "./providers/provider.factory";
import { AiRepository } from "./ai.repository";
import { PropertyModel } from "../properties/properties.model";
import { LeadModel } from "../leads/leads.model";
import { cacheGet, cacheSet } from "../../core/utils/cache";
import { hashInput } from "../../core/utils/hash";
import { env } from "../../core/config/env";
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

export const AiService = {
  async matchLeadProperties(leadId: string, propertyIds: string[] | undefined, userId: string, agencyId: string) {
    const lead = await LeadModel.findOne({ _id: leadId, agencyId });
    if (!lead) throw new Error("Lead not found");

    const filter: Record<string, unknown> = { agencyId, status: "available" };
    if (propertyIds && propertyIds.length > 0) {
      filter._id = { $in: propertyIds };
    }
    const properties = await PropertyModel.find(filter).lean();
    if (properties.length === 0) return { matches: [], provider: "", tokensUsed: 0, cached: false };

    const inputHash = hashInput({ leadId, propertyIds: properties.map((p) => p._id) });
    const cached = cacheGet<{ matches: unknown[] }>(inputHash);
    if (cached) return { ...cached, cached: true };

    const start = Date.now();
    const { data, tokensUsed, provider } = await callAIWithFallback({
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

    const result = (data as { matches: unknown[] }) || { matches: [] };
    const durationMs = Date.now() - start;

    const ttlMs = env.AI_CACHE_TTL_HOURS * 60 * 60 * 1000;
    cacheSet(inputHash, result, ttlMs);

    await AiRepository.persistAnalysis({
      agencyId: agencyId as any,
      userId: userId as any,
      type: "lead-matching",
      input: { leadId, propertyIds: properties.map((p) => p._id.toString()) },
      output: result as any,
      provider,
      tokensUsed,
      durationMs,
      success: true,
    });

    return { ...result, provider, tokensUsed, cached: false };
  },

  async generatePropertyDescription(propertyId: string, tone: "luxury" | "standard" | "brief", userId: string, agencyId: string) {
    const property = await PropertyModel.findOne({ _id: propertyId, agencyId });
    if (!property) throw new Error("Property not found");

    const inputHash = hashInput({ propertyId, tone });
    const cached = cacheGet<{ title: string; description: string; highlights: string[] }>(inputHash);
    if (cached) return { ...cached, cached: true };

    const start = Date.now();
    const { data, tokensUsed, provider } = await callAIWithFallback({
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

    const result = (data as { title: string; description: string; highlights: string[] }) || {};
    const durationMs = Date.now() - start;

    const ttlMs = env.AI_CACHE_TTL_HOURS * 60 * 60 * 1000;
    cacheSet(inputHash, result, ttlMs);

    await AiRepository.persistAnalysis({
      agencyId: agencyId as any,
      userId: userId as any,
      type: "property-description",
      input: { propertyId, tone },
      output: result as any,
      provider,
      tokensUsed,
      durationMs,
      success: true,
    });

    await AiRepository.persistCopy({
      agencyId: agencyId as any,
      userId: userId as any,
      type: "property-description",
      propertyId: propertyId as any,
      tone,
      content: result.description || "",
    });

    return { ...result, provider, tokensUsed, cached: false };
  },

  async generateOutreachEmail(leadId: string, propertyId: string, tone: "professional" | "friendly" | "urgent", userId: string, agencyId: string) {
    const lead = await LeadModel.findOne({ _id: leadId, agencyId });
    if (!lead) throw new Error("Lead not found");

    const property = await PropertyModel.findOne({ _id: propertyId, agencyId });
    if (!property) throw new Error("Property not found");

    const inputHash = hashInput({ leadId, propertyId, tone });
    const cached = cacheGet<{ subject: string; body: string }>(inputHash);
    if (cached) return { ...cached, cached: true };

    const start = Date.now();
    const { data, tokensUsed, provider } = await callAIWithFallback({
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

    const result = (data as { subject: string; body: string }) || {};
    const durationMs = Date.now() - start;

    const ttlMs = env.AI_CACHE_TTL_HOURS * 60 * 60 * 1000;
    cacheSet(inputHash, result, ttlMs);

    await AiRepository.persistAnalysis({
      agencyId: agencyId as any,
      userId: userId as any,
      type: "outreach-email",
      input: { leadId, propertyId, tone },
      output: result as any,
      provider,
      tokensUsed,
      durationMs,
      success: true,
    });

    await AiRepository.persistCopy({
      agencyId: agencyId as any,
      userId: userId as any,
      type: "outreach-email",
      propertyId: propertyId as any,
      leadId: leadId as any,
      tone,
      content: result.body || "",
    });

    return { ...result, provider, tokensUsed, cached: false };
  },
};
