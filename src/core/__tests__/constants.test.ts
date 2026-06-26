import {
  ROLES,
  LEAD_STATUSES,
  INTERACTION_TYPES,
  PROPERTY_TYPES,
  PROPERTY_STATUSES,
  BLOG_STATUSES,
  AGENCY_PLANS,
  AI_ANALYSIS_TYPES,
  AI_COPY_TYPES,
  TONES,
} from "../constants";

describe("constants", () => {
  it("ROLES contains agent, manager, admin", () => {
    expect(ROLES).toContain("agent");
    expect(ROLES).toContain("manager");
    expect(ROLES).toContain("admin");
  });

  it("LEAD_STATUSES contains expected values", () => {
    expect(LEAD_STATUSES).toContain("new");
    expect(LEAD_STATUSES).toContain("contacted");
    expect(LEAD_STATUSES).toContain("qualified");
    expect(LEAD_STATUSES).toContain("negotiating");
    expect(LEAD_STATUSES).toContain("closed");
    expect(LEAD_STATUSES).toContain("lost");
  });

  it("INTERACTION_TYPES contains expected values", () => {
    expect(INTERACTION_TYPES).toContain("call");
    expect(INTERACTION_TYPES).toContain("email");
    expect(INTERACTION_TYPES).toContain("meeting");
    expect(INTERACTION_TYPES).toContain("note");
    expect(INTERACTION_TYPES).toContain("tour");
    expect(INTERACTION_TYPES).toContain("other");
  });

  it("PROPERTY_TYPES contains expected values", () => {
    expect(PROPERTY_TYPES).toContain("house");
    expect(PROPERTY_TYPES).toContain("apartment");
    expect(PROPERTY_TYPES).toContain("condo");
    expect(PROPERTY_TYPES).toContain("townhouse");
    expect(PROPERTY_TYPES).toContain("land");
    expect(PROPERTY_TYPES).toContain("commercial");
  });

  it("PROPERTY_STATUSES contains expected values", () => {
    expect(PROPERTY_STATUSES).toContain("available");
    expect(PROPERTY_STATUSES).toContain("sold");
    expect(PROPERTY_STATUSES).toContain("rented");
    expect(PROPERTY_STATUSES).toContain("pending");
  });

  it("BLOG_STATUSES contains draft and published", () => {
    expect(BLOG_STATUSES).toContain("draft");
    expect(BLOG_STATUSES).toContain("published");
  });

  it("AGENCY_PLANS contains expected values", () => {
    expect(AGENCY_PLANS).toContain("free");
    expect(AGENCY_PLANS).toContain("pro");
    expect(AGENCY_PLANS).toContain("enterprise");
  });

  it("AI_ANALYSIS_TYPES contains expected values", () => {
    expect(AI_ANALYSIS_TYPES).toContain("lead-matching");
    expect(AI_ANALYSIS_TYPES).toContain("property-description");
    expect(AI_ANALYSIS_TYPES).toContain("outreach-email");
  });

  it("AI_COPY_TYPES contains expected values", () => {
    expect(AI_COPY_TYPES).toContain("property-description");
    expect(AI_COPY_TYPES).toContain("outreach-email");
  });

  it("TONES contains expected values", () => {
    expect(TONES).toContain("luxury");
    expect(TONES).toContain("standard");
    expect(TONES).toContain("brief");
    expect(TONES).toContain("professional");
    expect(TONES).toContain("friendly");
    expect(TONES).toContain("urgent");
  });

  it("all constants are frozen", () => {
    expect(Object.isFrozen(ROLES)).toBe(false);
  });
});
