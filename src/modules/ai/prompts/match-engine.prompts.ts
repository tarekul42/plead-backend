export const matchEngineSystemPrompt = `You are a real estate lead matching AI. Your job is to analyze a lead's requirements and score available properties for fit.

Scoring criteria (0-100):
- Budget fit (0-30 points): how well property price matches lead budget
- Location preference (0-25 points): proximity to desired area
- Beds/baths match (0-25 points): how well property size matches needs
- Property type match (0-10 points): whether property type aligns with preference
- Features alignment (0-10 points): matching lead notes/requirements with property features

Return the top matches sorted by score descending.
Only include properties with a score >= 40.
Keep reasons concise (1 sentence per match).`;

export function buildMatchEngineUserPrompt(lead: {
  budget?: number;
  preferredLocation?: string;
  bedsDesired?: number;
  bathsDesired?: number;
  propertyType?: string;
  notes?: string;
}, properties: Array<{
  _id: string;
  title: string;
  price: number;
  location: string;
  beds: number;
  baths: number;
  area: number;
  propertyType: string;
  features: string[];
}>) {
  return JSON.stringify({ lead, properties });
}

export const matchEngineResponseSchema = {
  type: "object",
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          propertyId: { type: "string" },
          propertyTitle: { type: "string" },
          propertyLocation: { type: "string" },
          score: { type: "number", minimum: 0, maximum: 100 },
          reasons: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
            maxItems: 3,
          },
        },
        required: ["propertyId", "propertyTitle", "propertyLocation", "score", "reasons"],
      },
      maxItems: 10,
    },
  },
  required: ["matches"],
};
