import { AiAnalysisModel, IAiAnalysis } from "./models/ai-analysis.model";
import { AiGeneratedCopyModel, IAiGeneratedCopy } from "./models/ai-copy.model";

export const AiRepository = {
  async persistAnalysis(data: Partial<IAiAnalysis>): Promise<IAiAnalysis> {
    return AiAnalysisModel.create(data);
  },

  async persistCopy(data: Partial<IAiGeneratedCopy>): Promise<IAiGeneratedCopy> {
    return AiGeneratedCopyModel.create(data);
  },
};
