const mockQbExec = jest.fn();

const mockWhere = jest.fn().mockReturnThis();
const mockSearch = jest.fn().mockReturnThis();
const mockSortDesc = jest.fn().mockReturnThis();
const mockPaginate = jest.fn().mockReturnThis();

jest.mock("../../../core/utils/query-builder", () => ({
  QueryBuilder: jest.fn(() => ({
    where: mockWhere,
    search: mockSearch,
    sortDesc: mockSortDesc,
    paginate: mockPaginate,
    exec: mockQbExec,
  })),
}));

jest.mock("../../../core/utils/app-error", () => {
  const actual = jest.requireActual("../../../core/utils/app-error");
  return { ...actual, InternalError: jest.fn((msg) => new Error(msg)) };
});

jest.mock("../../../core/utils/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

jest.mock("../../../core/utils/safe-error", () => ({
  getErrorMessage: (e: any) => String(e),
}));

const mockSession = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  endSession: jest.fn(),
};

const mockDeleteWithSession = jest.fn().mockResolvedValue({ deletedCount: 1 });

jest.mock("../leads.model", () => ({
  LeadModel: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn().mockReturnValue({ session: mockDeleteWithSession }),
    startSession: jest.fn().mockResolvedValue(mockSession),
  },
}));

jest.mock("../../interactions/interactions.model", () => ({
  InteractionModel: { deleteMany: jest.fn().mockReturnValue({ session: mockDeleteWithSession }) },
}));

import { LeadsRepository } from "../leads.repository";

describe("LeadsRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("delegates to QueryBuilder with agencyId filter", async () => {
      mockQbExec.mockResolvedValue({ data: [], total: 0 });

      await LeadsRepository.list({ agencyId: "ag1", page: 1, limit: 20 });

      expect(mockWhere).toHaveBeenCalledWith("agencyId", "ag1");
    });

    it("passes status, assignedAgentId, q filters", async () => {
      mockQbExec.mockResolvedValue({ data: [], total: 0 });

      await LeadsRepository.list({
        agencyId: "ag1",
        status: "active",
        assignedAgentId: "agent1",
        q: "john",
        page: 1,
        limit: 10,
      });

      expect(mockWhere).toHaveBeenCalledWith("status", "active");
      expect(mockWhere).toHaveBeenCalledWith("assignedAgentId", "agent1");
      expect(mockSearch).toHaveBeenCalledWith(["name", "email"], "john");
    });

    it("returns paginated data", async () => {
      const expected = { data: [{ id: "1", name: "Lead" }], total: 1 };
      mockQbExec.mockResolvedValue(expected);

      const result = await LeadsRepository.list({
        agencyId: "ag1",
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(expected);
    });
  });

  describe("findById", () => {
    it("queries with _id + agencyId + lean", async () => {
      const doc = { _id: "id1", name: "Lead" };
      const { LeadModel } = jest.requireMock("../leads.model");
      LeadModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(doc),
      });

      const result = await LeadsRepository.findById("id1", "ag1");
      expect(LeadModel.findOne).toHaveBeenCalledWith({ _id: "id1", agencyId: "ag1" });
      expect(result).toEqual(doc);
    });

    it("returns null when not found", async () => {
      const { LeadModel } = jest.requireMock("../leads.model");
      LeadModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await LeadsRepository.findById("nonexistent", "ag1");
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("calls LeadModel.create", async () => {
      const data = { name: "New Lead" };
      const { LeadModel } = jest.requireMock("../leads.model");
      LeadModel.create.mockResolvedValue(data);

      const result = await LeadsRepository.create(data as any);
      expect(LeadModel.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(data);
    });
  });

  describe("update", () => {
    it("calls findOneAndUpdate with { new: true }", async () => {
      const updated = { _id: "id1", name: "Updated" };
      const { LeadModel } = jest.requireMock("../leads.model");
      LeadModel.findOneAndUpdate.mockResolvedValue(updated);

      const result = await LeadsRepository.update("id1", "ag1", {
        name: "Updated",
      });
      expect(LeadModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "id1", agencyId: "ag1" },
        { name: "Updated" },
        { new: true },
      );
      expect(result).toEqual(updated);
    });

    it("returns null when not found", async () => {
      const { LeadModel } = jest.requireMock("../leads.model");
      LeadModel.findOneAndUpdate.mockResolvedValue(null);

      const result = await LeadsRepository.update("nonexistent", "ag1", {
        name: "Nope",
      });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("uses session, deletes lead + interactions, commits, returns true", async () => {
      const { LeadModel } = jest.requireMock("../leads.model");
      LeadModel.deleteOne.mockReturnValue({
        session: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      const result = await LeadsRepository.delete("id1", "ag1");
      expect(result).toBe(true);
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(LeadModel.deleteOne).toHaveBeenCalledWith({
        _id: "id1",
        agencyId: "ag1",
      });
    });

    it("returns false when lead not found", async () => {
      const { LeadModel } = jest.requireMock("../leads.model");
      LeadModel.deleteOne.mockReturnValue({
        session: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      const result = await LeadsRepository.delete("id1", "ag1");
      expect(result).toBe(false);
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
    });

    it("throws InternalError on failure", async () => {
      const { LeadModel } = jest.requireMock("../leads.model");
      LeadModel.deleteOne.mockReturnValue({
        session: jest.fn().mockRejectedValue(new Error("db error")),
      });

      await expect(
        LeadsRepository.delete("id1", "ag1"),
      ).rejects.toThrow("Failed to delete lead and associated data");
      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });
  });
});
