export const outreachEmailSystemPrompt = `You are a real estate agent assistant. Write professional outreach emails to leads about properties.

Keep emails:
- Warm and professional
- Personalized to lead's needs
- Focus on property features relevant to the lead
- Include a clear call to action
- Max 200 words`;

export function buildOutreachEmailUserPrompt(
  lead: {
    name: string;
    budget?: number;
    preferredLocation?: string;
    bedsDesired?: number;
  },
  property: {
    title: string;
    price: number;
    location: string;
    beds: number;
    baths: number;
    area: number;
    propertyType: string;
    features: string[];
  },
  tone: "professional" | "friendly" | "urgent",
) {
  try {
    return JSON.stringify({ lead, property, tone });
  } catch {
    return JSON.stringify({ lead: lead.name, property: property.title, tone });
  }
}

export const outreachEmailResponseSchema = {
  type: "object",
  properties: {
    subject: { type: "string" },
    body: { type: "string" },
  },
  required: ["subject", "body"],
};
