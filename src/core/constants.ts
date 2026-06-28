export const ROLES = ["agent", "manager", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "negotiating",
  "closed",
  "lost",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const INTERACTION_TYPES = ["call", "email", "meeting", "note", "tour", "other"] as const;
export type InteractionType = (typeof INTERACTION_TYPES)[number];

export const PROPERTY_TYPES = [
  "house",
  "apartment",
  "condo",
  "townhouse",
  "land",
  "commercial",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_STATUSES = ["available", "sold", "rented", "pending"] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const BLOG_STATUSES = ["draft", "published"] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

export const AGENCY_PLANS = ["free", "pro", "enterprise"] as const;
export type AgencyPlan = (typeof AGENCY_PLANS)[number];

export const AI_ANALYSIS_TYPES = [
  "lead-matching",
  "property-description",
  "outreach-email",
] as const;
export type AiAnalysisType = (typeof AI_ANALYSIS_TYPES)[number];

export const AI_COPY_TYPES = ["property-description", "outreach-email"] as const;
export type AiCopyType = (typeof AI_COPY_TYPES)[number];

export const TONES = ["luxury", "standard", "brief", "professional", "friendly", "urgent"] as const;
export type Tone = (typeof TONES)[number];
