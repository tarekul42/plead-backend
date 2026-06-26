jest.mock("../../users/users.model", () => ({
  UserModel: {
    countDocuments: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock("../../properties/properties.model", () => ({
  PropertyModel: { countDocuments: jest.fn() },
}));

jest.mock("../../leads/leads.model", () => ({
  LeadModel: { countDocuments: jest.fn() },
}));

jest.mock("../../reviews/reviews.model", () => ({
  ReviewModel: { countDocuments: jest.fn() },
}));

jest.mock("../../ai/models/ai-analysis.model", () => ({
  AiAnalysisModel: {
    countDocuments: jest.fn(),
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn(),
  },
}));

jest.mock("../../../core/utils/query-builder", () => ({
  QueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    sortDesc: jest.fn().mockReturnThis(),
    paginate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  })),
}));

import { AdminService } from "../admin.service";

describe("AdminService", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("getAgencyStats", () => {
    it("returns aggregated stats", async () => {
      const { UserModel } = require("../../users/users.model");
      const { PropertyModel } = require("../../properties/properties.model");
      const { LeadModel } = require("../../leads/leads.model");
      const { ReviewModel } = require("../../reviews/reviews.model");
      const { AiAnalysisModel } = require("../../ai/models/ai-analysis.model");

      UserModel.countDocuments.mockResolvedValue(10);
      PropertyModel.countDocuments.mockResolvedValue(20);
      LeadModel.countDocuments.mockResolvedValueOnce(30);
      LeadModel.countDocuments.mockResolvedValueOnce(15);
      ReviewModel.countDocuments.mockResolvedValue(5);
      AiAnalysisModel.countDocuments.mockResolvedValue(100);

      const stats = await AdminService.getAgencyStats("agency_1");
      expect(stats).toEqual({
        totalUsers: 10,
        totalProperties: 20,
        totalLeads: 30,
        activeLeads: 15,
        totalReviews: 5,
        aiCalls: 100,
      });
    });
  });

  describe("listUsers", () => {
    let qb: jest.Mock;
    let mockExec: jest.Mock;

    beforeEach(() => {
      qb = require("../../../core/utils/query-builder").QueryBuilder;
      mockExec = jest.fn().mockResolvedValue({ data: [], total: 0 });
      qb.mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        sortDesc: jest.fn().mockReturnThis(),
        paginate: jest.fn().mockReturnThis(),
        exec: mockExec,
      }));
    });

    it("returns paginated users", async () => {
      const result = await AdminService.listUsers("agency_1", 1, 50);
      expect(result).toEqual({ data: [], total: 0 });
    });

    it("uses default page and limit", async () => {
      await AdminService.listUsers("agency_1");
      expect(qb).toHaveBeenCalled();
    });
  });

  describe("toggleUserStatus", () => {
    it("toggles isActive", async () => {
      const { UserModel } = require("../../users/users.model");
      const mockSave = jest.fn().mockResolvedValue({ _id: "abc", isActive: false });
      UserModel.findOne.mockResolvedValue({ _id: "abc", isActive: true, save: mockSave });

      const result = await AdminService.toggleUserStatus("abc", "agency_1");
      expect(result!._id).toBe("abc");
      expect(mockSave).toHaveBeenCalled();
    });

    it("returns null when user not found", async () => {
      const { UserModel } = require("../../users/users.model");
      UserModel.findOne.mockResolvedValue(null);

      const result = await AdminService.toggleUserStatus("abc", "agency_1");
      expect(result).toBeNull();
    });
  });

  describe("getRecentAiAnalytics", () => {
    it("returns analytics with limit", async () => {
      const { AiAnalysisModel } = require("../../ai/models/ai-analysis.model");
      const data = [{ _id: "a1", type: "lead-matching" }];
      AiAnalysisModel.lean.mockResolvedValue(data);

      const result = await AdminService.getRecentAiAnalytics("agency_1", 10);
      expect(result).toEqual(data);
    });

    it("uses default limit of 20", async () => {
      const { AiAnalysisModel } = require("../../ai/models/ai-analysis.model");
      AiAnalysisModel.lean.mockResolvedValue([]);

      await AdminService.getRecentAiAnalytics("agency_1");
      expect(AiAnalysisModel.limit).toHaveBeenCalledWith(20);
    });
  });
});
