import {
  createInteractionSchema,
  updateInteractionSchema,
  interactionLeadParamSchema,
  interactionIdParamSchema,
} from "../interactions.validation";

describe("createInteractionSchema", () => {
  it("should accept valid minimal data with required type", () => {
    const result = createInteractionSchema.safeParse({ type: "call" });
    expect(result.success).toBe(true);
  });

  it("should accept all valid type values", () => {
    const types = ["call", "email", "meeting", "note", "tour", "other"];
    for (const type of types) {
      const result = createInteractionSchema.safeParse({ type });
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid type value", () => {
    const result = createInteractionSchema.safeParse({ type: "sms" });
    expect(result.success).toBe(false);
  });

  it("should reject missing type", () => {
    const result = createInteractionSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should accept optional fields", () => {
    const result = createInteractionSchema.safeParse({
      type: "email",
      subject: "Follow-up",
      notes: "Sent proposal",
      outcome: "Positive",
      scheduledAt: "2025-01-15T10:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("should reject subject exceeding 200 characters", () => {
    const result = createInteractionSchema.safeParse({
      type: "call",
      subject: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("should accept subject at exactly 200 characters", () => {
    const result = createInteractionSchema.safeParse({
      type: "call",
      subject: "a".repeat(200),
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid datetime format for scheduledAt", () => {
    const result = createInteractionSchema.safeParse({
      type: "call",
      scheduledAt: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-string scheduledAt", () => {
    const result = createInteractionSchema.safeParse({
      type: "call",
      scheduledAt: 12345,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateInteractionSchema", () => {
  it("should accept an empty object (all fields optional)", () => {
    const result = updateInteractionSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should accept valid partial update", () => {
    const result = updateInteractionSchema.safeParse({ type: "meeting", notes: "Rescheduled" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid type value", () => {
    const result = updateInteractionSchema.safeParse({ type: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should reject subject exceeding 200 characters", () => {
    const result = updateInteractionSchema.safeParse({ subject: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("should reject invalid datetime for scheduledAt", () => {
    const result = updateInteractionSchema.safeParse({ scheduledAt: "2025/01/15" });
    expect(result.success).toBe(false);
  });
});

describe("interactionLeadParamSchema", () => {
  it("should accept valid 24-char hex ObjectId", () => {
    const result = interactionLeadParamSchema.safeParse({ leadId: "507f1f77bcf86cd799439011" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid ObjectId", () => {
    const result = interactionLeadParamSchema.safeParse({ leadId: "123" });
    expect(result.success).toBe(false);
  });

  it("should reject non-hex ObjectId", () => {
    const result = interactionLeadParamSchema.safeParse({ leadId: "zzzzzzzzzzzzzzzzzzzzzzzz" });
    expect(result.success).toBe(false);
  });

  it("should reject missing leadId", () => {
    const result = interactionLeadParamSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("interactionIdParamSchema", () => {
  it("should accept valid ObjectId", () => {
    const result = interactionIdParamSchema.safeParse({ id: "507f1f77bcf86cd799439011" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid ObjectId", () => {
    const result = interactionIdParamSchema.safeParse({ id: "invalid" });
    expect(result.success).toBe(false);
  });
});
