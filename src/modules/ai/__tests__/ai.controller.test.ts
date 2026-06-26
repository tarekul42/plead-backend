import { Request, Response } from "express";

jest.mock("../ai.service", () => ({
  AiService: {
    matchLeadProperties: jest.fn(),
    generatePropertyDescription: jest.fn(),
    generateOutreachEmail: jest.fn(),
  },
}));

jest.mock("../ai.repository", () => ({}));
jest.mock("../models/ai-analysis.model", () => ({}));
jest.mock("../models/ai-copy.model", () => ({}));
jest.mock("../../properties/properties.model", () => ({}));
jest.mock("../../leads/leads.model", () => ({}));
jest.mock("../../../core/utils/cache", () => ({}));

import { AiController } from "../ai.controller";

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    user: { id: "user_1", agencyId: "agency_1", role: "agent", clerkId: "clerk_1", email: "a@b.com" },
    params: {}, query: {}, body: {},
    ...overrides,
  } as Request;
}
function mockRes() {
  const res: Partial<Response> = {};
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("AiController", () => {
  let svc: Record<string, jest.Mock>;
  beforeEach(() => {
    svc = jest.requireMock("../ai.service").AiService;
    jest.clearAllMocks();
  });

  it("matchLeadProperties calls service", async () => {
    const req = mockReq({ body: { leadId: "lead_1", propertyIds: ["prop_1"] } });
    const res = mockRes(); const next = jest.fn();
    svc.matchLeadProperties.mockResolvedValue({ matches: [] });
    await AiController.matchLeadProperties(req, res, next);
    expect(svc.matchLeadProperties).toHaveBeenCalledWith("lead_1", ["prop_1"], "user_1", "agency_1");
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("generatePropertyDescription calls service", async () => {
    const req = mockReq({ body: { propertyId: "prop_1", tone: "luxury" } });
    const res = mockRes(); const next = jest.fn();
    svc.generatePropertyDescription.mockResolvedValue({ description: "desc" });
    await AiController.generatePropertyDescription(req, res, next);
    expect(svc.generatePropertyDescription).toHaveBeenCalledWith("prop_1", "luxury", "user_1", "agency_1");
  });

  it("generateOutreachEmail calls service", async () => {
    const req = mockReq({ body: { leadId: "lead_1", propertyId: "prop_1", tone: "friendly" } });
    const res = mockRes(); const next = jest.fn();
    svc.generateOutreachEmail.mockResolvedValue({ subject: "Hi" });
    await AiController.generateOutreachEmail(req, res, next);
    expect(svc.generateOutreachEmail).toHaveBeenCalledWith("lead_1", "prop_1", "friendly", "user_1", "agency_1");
  });
});
