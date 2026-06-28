const mockQbExec = jest.fn();

const mockWhere = jest.fn().mockReturnThis();
const mockSortAsc = jest.fn().mockReturnThis();
const mockPaginate = jest.fn().mockReturnThis();

jest.mock("../../../core/utils/query-builder", () => ({
  QueryBuilder: jest.fn(() => ({
    where: mockWhere,
    sortAsc: mockSortAsc,
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

jest.mock("../agencies.model", () => ({
  AgencyModel: {
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    deleteOne: jest.fn().mockReturnValue({ session: mockDeleteWithSession }),
    startSession: jest.fn().mockResolvedValue(mockSession),
  },
}));

jest.mock("../../users/users.model", () => ({
  UserModel: { deleteMany: jest.fn().mockReturnValue({ session: mockDeleteWithSession }) },
}));

jest.mock("../../properties/properties.model", () => ({
  PropertyModel: { deleteMany: jest.fn().mockReturnValue({ session: mockDeleteWithSession }) },
}));

jest.mock("../../leads/leads.model", () => ({
  LeadModel: { deleteMany: jest.fn().mockReturnValue({ session: mockDeleteWithSession }) },
}));

jest.mock("../../interactions/interactions.model", () => ({
  InteractionModel: { deleteMany: jest.fn().mockReturnValue({ session: mockDeleteWithSession }) },
}));

jest.mock("../../reviews/reviews.model", () => ({
  ReviewModel: { deleteMany: jest.fn().mockReturnValue({ session: mockDeleteWithSession }) },
}));

jest.mock("../../blogs/blogs.model", () => ({
  BlogModel: { deleteMany: jest.fn().mockReturnValue({ session: mockDeleteWithSession }) },
}));

jest.mock("../../ai/models/ai-analysis.model", () => ({
  AiAnalysisModel: { deleteMany: jest.fn().mockReturnValue({ session: mockDeleteWithSession }) },
}));

import { AgenciesRepository } from "../agencies.repository";

describe("AgenciesRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("delegates to QueryBuilder with correct sorting/pagination and returns data", async () => {
      const expected = { data: [{ id: "1", name: "Test Agency" }], total: 1 };
      mockQbExec.mockResolvedValue(expected);

      const result = await AgenciesRepository.findAll("agency-id", 1, 20);

      expect(result).toEqual(expected);
      const { AgencyModel } = jest.requireMock("../agencies.model");
      const { QueryBuilder } = jest.requireMock("../../../core/utils/query-builder");
      expect(QueryBuilder).toHaveBeenCalledWith(AgencyModel);
      expect(mockSortAsc).toHaveBeenCalledWith("name");
      expect(mockPaginate).toHaveBeenCalledWith(1, 20, 100, 20);
    });
  });

  describe("findById", () => {
    it("queries by ID with lean and returns agency", async () => {
      const doc = { _id: "id1", name: "Agency" };
      const { AgencyModel } = jest.requireMock("../agencies.model");
      AgencyModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(doc),
      });

      const result = await AgenciesRepository.findById("id1");
      expect(result).toEqual(doc);
    });

    it("returns null when not found", async () => {
      const { AgencyModel } = jest.requireMock("../agencies.model");
      AgencyModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await AgenciesRepository.findById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findBySlug", () => {
    it("queries by slug with lean", async () => {
      const { AgencyModel } = jest.requireMock("../agencies.model");
      AgencyModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ slug: "my-agency" }),
      });

      const result = await AgenciesRepository.findBySlug("my-agency");
      expect(result).toEqual({ slug: "my-agency" });
    });
  });

  describe("create", () => {
    it("calls AgencyModel.create with data", async () => {
      const data = { name: "New Agency" };
      const { AgencyModel } = jest.requireMock("../agencies.model");
      AgencyModel.create.mockResolvedValue(data);

      const result = await AgenciesRepository.create(data as any);
      expect(AgencyModel.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(data);
    });
  });

  describe("update", () => {
    it("calls findByIdAndUpdate with { new: true }", async () => {
      const updated = { _id: "id1", name: "Updated" };
      const { AgencyModel } = jest.requireMock("../agencies.model");
      AgencyModel.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await AgenciesRepository.update("id1", { name: "Updated" });
      expect(AgencyModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "id1",
        { name: "Updated" },
        { new: true },
      );
      expect(result).toEqual(updated);
    });

    it("returns null when not found", async () => {
      const { AgencyModel } = jest.requireMock("../agencies.model");
      AgencyModel.findByIdAndUpdate.mockResolvedValue(null);

      const result = await AgenciesRepository.update("nonexistent", { name: "Nope" });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("starts session, deletes from all collections, commits, returns true", async () => {
      const result = await AgenciesRepository.delete("id1");

      expect(result).toBe(true);
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();

      const { AgencyModel } = jest.requireMock("../agencies.model");
      expect(AgencyModel.deleteOne).toHaveBeenCalledWith({ _id: "id1" });
      const { UserModel } = jest.requireMock("../../users/users.model");
      expect(UserModel.deleteMany).toHaveBeenCalledWith({ agencyId: "id1" });
    });

    it("returns false when agency not found", async () => {
      const { AgencyModel } = jest.requireMock("../agencies.model");
      AgencyModel.deleteOne.mockReturnValue({
        session: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      const result = await AgenciesRepository.delete("id1");
      expect(result).toBe(false);
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it("retries on TransientTransactionError and eventually succeeds", async () => {
      const transientError = new Error("transient");
      (transientError as any).errorLabels = ["TransientTransactionError"];

      const { AgencyModel } = jest.requireMock("../agencies.model");
      const mockDeleteOneSession = jest
        .fn()
        .mockRejectedValueOnce(transientError)
        .mockRejectedValueOnce(transientError)
        .mockResolvedValue({ deletedCount: 1 });
      AgencyModel.deleteOne.mockReturnValue({ session: mockDeleteOneSession });

      const result = await AgenciesRepository.delete("id1");
      expect(result).toBe(true);
      expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
      expect(mockSession.abortTransaction).toHaveBeenCalledTimes(2);
    });

    it("throws InternalError when retries exhausted", async () => {
      const transientError = new Error("transient");
      (transientError as any).errorLabels = ["TransientTransactionError"];

      const { UserModel } = jest.requireMock("../../users/users.model");
      UserModel.deleteMany.mockReturnValue({
        session: jest.fn().mockRejectedValue(transientError),
      });

      await expect(AgenciesRepository.delete("id1")).rejects.toThrow("Failed to delete agency");
      expect(mockSession.abortTransaction).toHaveBeenCalledTimes(3);
    });
  });
});
