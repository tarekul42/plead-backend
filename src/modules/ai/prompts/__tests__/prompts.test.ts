import { buildMatchEngineUserPrompt } from "../match-engine.prompts";
import { buildOutreachEmailUserPrompt } from "../outreach-email.prompts";
import { buildPropertyDescriptionUserPrompt } from "../property-description.prompts";

describe("buildMatchEngineUserPrompt", () => {
  const lead = { budget: 500000, preferredLocation: "NYC", bedsDesired: 3, bathsDesired: 2 };
  const properties = [
    {
      _id: "prop1",
      title: "Luxury Condo",
      price: 480000,
      location: "NYC",
      beds: 3,
      baths: 2,
      area: 1500,
      propertyType: "condo",
      features: ["pool", "gym"],
    },
  ];

  it("returns JSON string with lead and properties", () => {
    const result = buildMatchEngineUserPrompt(lead, properties);
    expect(result).toBe(JSON.stringify({ lead, properties }));
  });

  it("returns string even with empty lead object", () => {
    const result = buildMatchEngineUserPrompt({}, []);
    expect(typeof result).toBe("string");
    expect(JSON.parse(result)).toEqual({ lead: {}, properties: [] });
  });

  it("handles circular references by using fallback", () => {
    const circular: any = { budget: 500000 };
    circular.self = circular;
    const result = buildMatchEngineUserPrompt(circular, properties);
    expect(result).toBe(
      JSON.stringify({
        lead: Object.keys(circular),
        properties: properties.map((p) => p._id),
      }),
    );
  });

  it("handles circular references in properties by using fallback", () => {
    const circularProp: any = { ...properties[0] };
    circularProp.self = circularProp;
    const result = buildMatchEngineUserPrompt(lead, [circularProp]);
    expect(result).toBe(
      JSON.stringify({
        lead: Object.keys(lead),
        properties: [circularProp._id],
      }),
    );
  });

  it("handles null lead gracefully", () => {
    const result = buildMatchEngineUserPrompt(null as any, []);
    expect(result).toBe(JSON.stringify({ lead: null, properties: [] }));
  });
});

describe("buildOutreachEmailUserPrompt", () => {
  const lead = { name: "John", budget: 500000, preferredLocation: "NYC", bedsDesired: 3 };
  const property = {
    title: "Luxury Condo",
    price: 480000,
    location: "NYC",
    beds: 3,
    baths: 2,
    area: 1500,
    propertyType: "condo",
    features: ["pool", "gym"],
  };

  it("returns JSON string with lead, property and tone", () => {
    const result = buildOutreachEmailUserPrompt(lead, property, "professional");
    expect(result).toBe(JSON.stringify({ lead, property, tone: "professional" }));
  });

  it("works with friendly tone", () => {
    const result = buildOutreachEmailUserPrompt(lead, property, "friendly");
    expect(JSON.parse(result).tone).toBe("friendly");
  });

  it("works with urgent tone", () => {
    const result = buildOutreachEmailUserPrompt(lead, property, "urgent");
    expect(JSON.parse(result).tone).toBe("urgent");
  });

  it("handles circular references by using fallback", () => {
    const circular: any = { ...lead };
    circular.self = circular;
    const result = buildOutreachEmailUserPrompt(circular, property, "professional");
    expect(result).toBe(
      JSON.stringify({ lead: circular.name, property: property.title, tone: "professional" }),
    );
  });

  it("handles circular references in property by using fallback", () => {
    const circularProp: any = { ...property };
    circularProp.self = circularProp;
    const result = buildOutreachEmailUserPrompt(lead, circularProp, "friendly");
    expect(result).toBe(
      JSON.stringify({ lead: lead.name, property: circularProp.title, tone: "friendly" }),
    );
  });
});

describe("buildPropertyDescriptionUserPrompt", () => {
  const property = {
    title: "Luxury Condo",
    price: 480000,
    location: "NYC",
    beds: 3,
    baths: 2,
    area: 1500,
    propertyType: "condo",
    features: ["pool"],
    description: "Beautiful condo in the heart of NYC",
  };

  it("returns JSON string with property and tone", () => {
    const result = buildPropertyDescriptionUserPrompt(property, "luxury");
    expect(result).toBe(JSON.stringify({ property, tone: "luxury" }));
  });

  it("works with standard tone", () => {
    const result = buildPropertyDescriptionUserPrompt(property, "standard");
    expect(JSON.parse(result).tone).toBe("standard");
  });

  it("works with brief tone", () => {
    const result = buildPropertyDescriptionUserPrompt(property, "brief");
    expect(JSON.parse(result).tone).toBe("brief");
  });

  it("handles circular references by using fallback", () => {
    const circular: any = { ...property };
    circular.self = circular;
    const result = buildPropertyDescriptionUserPrompt(circular, "luxury");
    expect(result).toBe(JSON.stringify({ property: circular.title, tone: "luxury" }));
  });

  it("returns string even with empty property", () => {
    const result = buildPropertyDescriptionUserPrompt({} as any, "standard");
    expect(typeof result).toBe("string");
  });
});
