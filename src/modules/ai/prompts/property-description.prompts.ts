export const propertyDescriptionSystemPrompt = `You are a real estate copywriter. Generate compelling property descriptions based on property details.`;

export function buildPropertyDescriptionUserPrompt(property: {
  title: string;
  price: number;
  location: string;
  beds: number;
  baths: number;
  area: number;
  propertyType: string;
  features: string[];
  description: string;
}, tone: "luxury" | "standard" | "brief") {
  return JSON.stringify({ property, tone });
}

export const propertyDescriptionResponseSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    highlights: {
      type: "array",
      items: { type: "string" },
      maxItems: 5,
    },
  },
  required: ["title", "description", "highlights"],
};
