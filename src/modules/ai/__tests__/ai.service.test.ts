const mockCallAI = jest.fn();
jest.mock("../providers/provider.factory", () => ({
  callAIWithFallback: mockCallAI,
}));

const mockAnalyzeCreate = jest.fn();
const mockCopyCreate = jest.fn();
jest.mock("../ai.repository", () => ({
  AiRepository: {
    persistAnalysis: mockAnalyzeCreate,
    persistCopy: mockCopyCreate,
  },
}));

const mockLeadFindOne = jest.fn();
const mockPropertyFind = jest.fn();
const mockPropertyFindOne = jest.fn();
jest.mock("../../properties/properties.model", () => ({
  PropertyModel: { find: mockPropertyFind, findOne: mockPropertyFindOne },
}));
jest.mock("../../leads/leads.model", () => ({
  LeadModel: { findOne: mockLeadFindOne },
}));

const mockCacheGet = jest.fn();
const mockCacheSet = jest.fn();
jest.mock("../../../core/utils/cache", () => ({
  cacheGet: mockCacheGet,
  cacheSet: mockCacheSet,
}));

jest.mock("../../../core/utils/logger", () => ({ logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() } }));
jest.mock("../../../core/utils/safe-error", () => ({ getErrorMessage: (e: any) => String(e) }));

jest.mock("mongoose", () => {
  const ObjectId = jest.fn((id: string) => id) as any;
  const mockSchemaInstance = { index: jest.fn() };
  const Schema = jest.fn(() => mockSchemaInstance) as any;
  Schema.Types = { ObjectId, Mixed: Object };
  const mMongoose = {
    Types: { ObjectId },
    Schema,
    connections: [{ readyState: 1 }],
    connection: { readyState: 1, on: jest.fn(), close: jest.fn() },
    model: jest.fn(() => ({ deleteMany: jest.fn(() => ({ session: jest.fn() })), create: jest.fn() })),
  };
  return mMongoose;
});

import { AiService } from "../ai.service";

describe("AiService", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("matchLeadProperties", () => {
    it("throws when lead not found", async () => {
      mockLeadFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      await expect(AiService.matchLeadProperties("lead_1", undefined, "user_1", "ag_1")).rejects.toThrow();
    });

    it("returns empty matches when no properties found", async () => {
      mockLeadFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: "lead_1", budget: 500000 }) });
      mockPropertyFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      const result = await AiService.matchLeadProperties("lead_1", undefined, "user_1", "ag_1");
      expect(result).toEqual({ matches: [], provider: "", tokensUsed: 0, cached: false });
    });

    it("returns cached result when available", async () => {
      mockLeadFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: "lead_1" }) });
      mockPropertyFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([{ _id: "prop_1" }]) });
      mockCacheGet.mockResolvedValue({ matches: [{ score: 0.9 }] });

      const result = await AiService.matchLeadProperties("lead_1", ["prop_1"], "user_1", "ag_1");
      expect(result.cached).toBe(true);
      expect(result.matches).toEqual([{ score: 0.9 }]);
    });

    it("calls AI and persists result on cache miss", async () => {
      mockLeadFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: "lead_1", budget: 500000 }) });
      mockPropertyFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([{ _id: "prop_1", title: "House" }]) });
      mockCacheGet.mockResolvedValue(undefined);
      mockCallAI.mockResolvedValue({ data: { matches: [{ score: 0.8 }] }, tokensUsed: 100, provider: "gemini" });

      const result = await AiService.matchLeadProperties("lead_1", undefined, "user_1", "ag_1") as { provider: string };
      expect(result.provider).toBe("gemini");
      expect(mockAnalyzeCreate).toHaveBeenCalled();
      expect(mockCacheSet).toHaveBeenCalled();
    });

    it("returns rule-based fallback when AI fails", async () => {
      mockLeadFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: "lead_1", budget: 500000 }) });
      mockPropertyFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([{ _id: "prop_1", title: "House", price: 400000, location: "NYC", beds: 3, baths: 2, area: 1500, propertyType: "house", features: ["garage"] }]) });
      mockCacheGet.mockResolvedValue(undefined);
      mockCallAI.mockRejectedValue(new Error("AI down"));

      const result = await AiService.matchLeadProperties("lead_1", undefined, "user_1", "ag_1");
      expect(result.matches).toBeDefined();
      expect(Array.isArray(result.matches)).toBe(true);
    });
  });

  describe("generatePropertyDescription", () => {
    it("throws when property not found", async () => {
      mockPropertyFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      await expect(AiService.generatePropertyDescription("prop_1", "luxury", "user_1", "ag_1")).rejects.toThrow();
    });

    it("caches and returns result", async () => {
      mockPropertyFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: "prop_1", title: "House" }) });
      mockCacheGet.mockResolvedValue(undefined);
      mockCallAI.mockResolvedValue({ data: { title: "desc", description: "desc", highlights: ["a"] }, tokensUsed: 50, provider: "groq" });

      const result = await AiService.generatePropertyDescription("prop_1", "luxury", "user_1", "ag_1");
      expect(result.description).toBe("desc");
      expect(mockCopyCreate).toHaveBeenCalled();
      expect(mockAnalyzeCreate).toHaveBeenCalled();
    });
  });

  describe("generateOutreachEmail", () => {
    it("throws when lead not found", async () => {
      mockLeadFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      mockPropertyFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({}) });
      await expect(AiService.generateOutreachEmail("lead_1", "prop_1", "professional", "user_1", "ag_1")).rejects.toThrow();
    });

    it("throws when property not found", async () => {
      mockLeadFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: "lead_1" }) });
      mockPropertyFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      await expect(AiService.generateOutreachEmail("lead_1", "prop_1", "professional", "user_1", "ag_1")).rejects.toThrow();
    });

    it("returns generated email", async () => {
      mockLeadFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: "lead_1", name: "Bob" }) });
      mockPropertyFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: "prop_1", title: "House" }) });
      mockCacheGet.mockResolvedValue(undefined);
      mockCallAI.mockResolvedValue({ data: { subject: "Hi", body: "Hello" }, tokensUsed: 30, provider: "gemini" });

      const result = await AiService.generateOutreachEmail("lead_1", "prop_1", "professional", "user_1", "ag_1");
      expect(result.subject).toBe("Hi");
      expect(result.body).toBe("Hello");
      expect(mockCopyCreate).toHaveBeenCalled();
    });
  });
});
