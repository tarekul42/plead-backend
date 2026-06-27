import { createLeadSchema, updateLeadSchema, leadParamSchema } from "../leads.validation";

const VALID_OBJECT_ID = "507f1f77bcf86cd799439011";

describe("createLeadSchema", () => {
  it("accepts valid lead with all fields", () => {
    const result = createLeadSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      budget: 500000,
      preferredLocation: "Downtown",
      propertyType: "apartment",
      bedsDesired: 2,
      bathsDesired: 1,
      notes: "Interested in quick closing",
      status: "new",
      source: "referral",
      assignedAgentId: VALID_OBJECT_ID,
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal valid lead (name, email, assignedAgentId)", () => {
    const result = createLeadSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      assignedAgentId: VALID_OBJECT_ID,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createLeadSchema.safeParse({
      name: "",
      email: "jane@example.com",
      assignedAgentId: VALID_OBJECT_ID,
    });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 200 characters", () => {
    const result = createLeadSchema.safeParse({
      name: "a".repeat(201),
      email: "jane@example.com",
      assignedAgentId: VALID_OBJECT_ID,
    });
    expect(result.success).toBe(false);
  });

  it("accepts name at exactly 200 characters", () => {
    const result = createLeadSchema.safeParse({
      name: "a".repeat(200),
      email: "jane@example.com",
      assignedAgentId: VALID_OBJECT_ID,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = createLeadSchema.safeParse({
      name: "John",
      email: "not-an-email",
      assignedAgentId: VALID_OBJECT_ID,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative budget", () => {
    const result = createLeadSchema.safeParse({
      name: "John",
      email: "john@example.com",
      budget: -100,
      assignedAgentId: VALID_OBJECT_ID,
    });
    expect(result.success).toBe(false);
  });

  it("accepts budget of zero", () => {
    const result = createLeadSchema.safeParse({
      name: "John",
      email: "john@example.com",
      budget: 0,
      assignedAgentId: VALID_OBJECT_ID,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative bedsDesired", () => {
    const result = createLeadSchema.safeParse({
      name: "John",
      email: "john@example.com",
      bedsDesired: -1,
      assignedAgentId: VALID_OBJECT_ID,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative bathsDesired", () => {
    const result = createLeadSchema.safeParse({
      name: "John",
      email: "john@example.com",
      bathsDesired: -1,
      assignedAgentId: VALID_OBJECT_ID,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status enum value", () => {
    const result = createLeadSchema.safeParse({
      name: "John",
      email: "john@example.com",
      status: "invalid_status",
      assignedAgentId: VALID_OBJECT_ID,
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid status values", () => {
    const validStatuses = ["new", "contacted", "qualified", "negotiating", "closed", "lost"];
    for (const status of validStatuses) {
      const result = createLeadSchema.safeParse({
        name: "John",
        email: "john@example.com",
        status,
        assignedAgentId: VALID_OBJECT_ID,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid ObjectId for assignedAgentId", () => {
    const result = createLeadSchema.safeParse({
      name: "John",
      email: "john@example.com",
      assignedAgentId: "invalid-id",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing assignedAgentId", () => {
    const result = createLeadSchema.safeParse({
      name: "John",
      email: "john@example.com",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateLeadSchema", () => {
  it("accepts partial update with all fields", () => {
    const result = updateLeadSchema.safeParse({
      name: "Updated Name",
      email: "updated@example.com",
      phone: "+9876543210",
      budget: 750000,
      preferredLocation: "Uptown",
      propertyType: "house",
      bedsDesired: 3,
      bathsDesired: 2,
      notes: "Updated notes",
      status: "qualified",
      source: "website",
      assignedAgentId: VALID_OBJECT_ID,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (all fields optional)", () => {
    const result = updateLeadSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects empty name when provided", () => {
    const result = updateLeadSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 200 characters", () => {
    const result = updateLeadSchema.safeParse({ name: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email when provided", () => {
    const result = updateLeadSchema.safeParse({ email: "bad-email" });
    expect(result.success).toBe(false);
  });

  it("rejects negative budget when provided", () => {
    const result = updateLeadSchema.safeParse({ budget: -50 });
    expect(result.success).toBe(false);
  });

  it("rejects negative bedsDesired when provided", () => {
    const result = updateLeadSchema.safeParse({ bedsDesired: -2 });
    expect(result.success).toBe(false);
  });

  it("rejects negative bathsDesired when provided", () => {
    const result = updateLeadSchema.safeParse({ bathsDesired: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status enum", () => {
    const result = updateLeadSchema.safeParse({ status: "unknown" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid ObjectId for assignedAgentId when provided", () => {
    const result = updateLeadSchema.safeParse({ assignedAgentId: "bad-id" });
    expect(result.success).toBe(false);
  });

  it("accepts omitted assignedAgentId", () => {
    const result = updateLeadSchema.safeParse({ name: "Just a name update" });
    expect(result.success).toBe(true);
  });
});

describe("leadParamSchema", () => {
  it("accepts valid ObjectId param", () => {
    const result = leadParamSchema.safeParse({ id: VALID_OBJECT_ID });
    expect(result.success).toBe(true);
  });

  it("rejects invalid ObjectId", () => {
    const result = leadParamSchema.safeParse({ id: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects missing id", () => {
    const result = leadParamSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-hex characters in ObjectId", () => {
    const result = leadParamSchema.safeParse({ id: "507f1f77bcf86cd79943901z" });
    expect(result.success).toBe(false);
  });

  it("rejects ObjectId with wrong length", () => {
    const result = leadParamSchema.safeParse({ id: "507f1f77bcf86cd79943901" });
    expect(result.success).toBe(false);
  });

  it("rejects empty string id", () => {
    const result = leadParamSchema.safeParse({ id: "" });
    expect(result.success).toBe(false);
  });
});
