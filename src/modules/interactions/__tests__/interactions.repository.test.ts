const mockQbExec = jest.fn();

const mockWhere = jest.fn().mockReturnThis();
const mockSortDesc = jest.fn().mockReturnThis();
const mockPaginate = jest.fn().mockReturnThis();

jest.mock("../../../core/utils/query-builder", () => ({
  QueryBuilder: jest.fn(() => ({
    where: mockWhere,
    sortDesc: mockSortDesc,
    paginate: mockPaginate,
    exec: mockQbExec,
  })),
}));

jest.mock("../interactions.model", () => ({
  InteractionModel: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    create: jest.fn(),
  },
}));

import { InteractionsRepository } from "../interactions.repository";

describe("InteractionsRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listByAgency", () => {
    it("delegates to QueryBuilder with agencyId", async () => {
      mockQbExec.mockResolvedValue({ data: [{ id: "1" }], total: 1 });

      const result = await InteractionsRepository.listByAgency("agency_1");

      expect(mockWhere).toHaveBeenCalledWith("agencyId", "agency_1");
      expect(result).toEqual({ data: [{ id: "1" }], total: 1 });
    });

    it("returns paginated data", async () => {
      mockQbExec.mockResolvedValue({ data: [{ id: "2" }, { id: "3" }], total: 2 });

      const result = await InteractionsRepository.listByAgency("agency_1", 2, 25);

      expect(mockPaginate).toHaveBeenCalledWith(2, 25, 100, 50);
      expect(result).toEqual({ data: [{ id: "2" }, { id: "3" }], total: 2 });
    });
  });

  describe("listByUser", () => {
    it("queries with agencyId + performedById via QueryBuilder", async () => {
      mockQbExec.mockResolvedValue({ data: [{ id: "1" }], total: 1 });

      const result = await InteractionsRepository.listByUser("user_1", "agency_1");

      expect(mockWhere).toHaveBeenCalledWith("agencyId", "agency_1");
      expect(mockWhere).toHaveBeenCalledWith("performedById", "user_1");
      expect(result).toEqual({ data: [{ id: "1" }], total: 1 });
    });
  });

  describe("listByLead", () => {
    it("queries with leadId + agencyId via QueryBuilder", async () => {
      mockQbExec.mockResolvedValue({ data: [{ id: "1" }], total: 1 });

      const result = await InteractionsRepository.listByLead("lead_1", "agency_1");

      expect(mockWhere).toHaveBeenCalledWith("leadId", "lead_1");
      expect(mockWhere).toHaveBeenCalledWith("agencyId", "agency_1");
      expect(result).toEqual({ data: [{ id: "1" }], total: 1 });
    });
  });

  describe("findById", () => {
    it("queries with _id + agencyId + lean, returns interaction", async () => {
      const doc = { _id: "abc", agencyId: "agency_1", type: "email" };
      (jest.requireMock("../interactions.model").InteractionModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(doc),
      });

      const result = await InteractionsRepository.findById("abc", "agency_1");

      expect(result).toEqual(doc);
    });

    it("returns null when not found", async () => {
      (jest.requireMock("../interactions.model").InteractionModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await InteractionsRepository.findById("nonexistent", "agency_1");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("calls InteractionModel.create with data", async () => {
      const data = { type: "email", agencyId: "agency_1", performedById: "user_1" };
      (jest.requireMock("../interactions.model").InteractionModel.create as jest.Mock).mockResolvedValue(data);

      const result = await InteractionsRepository.create(data as any);

      expect(result).toEqual(data);
    });
  });

  describe("update", () => {
    it("calls findOneAndUpdate with { new: true }", async () => {
      const updated = { _id: "abc", agencyId: "agency_1", type: "call" };
      (jest.requireMock("../interactions.model").InteractionModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updated);

      const result = await InteractionsRepository.update("abc", "agency_1", { type: "call" } as any);

      expect(result).toEqual(updated);
    });

    it("returns null when not found", async () => {
      (jest.requireMock("../interactions.model").InteractionModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await InteractionsRepository.update("nonexistent", "agency_1", { type: "call" } as any);

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("returns true when deleted", async () => {
      (jest.requireMock("../interactions.model").InteractionModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      const result = await InteractionsRepository.delete("abc", "agency_1");

      expect(result).toBe(true);
    });

    it("returns false when nothing deleted", async () => {
      (jest.requireMock("../interactions.model").InteractionModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      const result = await InteractionsRepository.delete("nonexistent", "agency_1");

      expect(result).toBe(false);
    });
  });
});
