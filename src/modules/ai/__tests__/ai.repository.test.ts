jest.mock("../models/ai-analysis.model", () => ({
  AiAnalysisModel: { create: jest.fn() },
}));

jest.mock("../models/ai-copy.model", () => ({
  AiGeneratedCopyModel: { create: jest.fn() },
}));

import { AiRepository } from "../ai.repository";

describe("AiRepository", () => {
  beforeEach(() => jest.clearAllMocks());

  it("persistAnalysis creates analysis record", async () => {
    const { AiAnalysisModel } = require("../models/ai-analysis.model");
    const data = { type: "lead-matching" as const, agencyId: "ag_1" as any };
    AiAnalysisModel.create.mockResolvedValue(data);
    const result = await AiRepository.persistAnalysis(data as any);
    expect(AiAnalysisModel.create).toHaveBeenCalledWith(data);
    expect(result).toEqual(data);
  });

  it("persistCopy creates copy record", async () => {
    const { AiGeneratedCopyModel } = require("../models/ai-copy.model");
    const data = { type: "property-description" as const, content: "desc" };
    AiGeneratedCopyModel.create.mockResolvedValue(data);
    const result = await AiRepository.persistCopy(data as any);
    expect(AiGeneratedCopyModel.create).toHaveBeenCalledWith(data);
    expect(result).toEqual(data);
  });
});
