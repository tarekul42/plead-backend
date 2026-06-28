import { InteractionsService } from "../interactions.service";
import { InteractionsRepository } from "../interactions.repository";
import { IInteraction } from "../interactions.model";
import { LeadModel } from "../../leads/leads.model";
import { AppError } from "../../../core/utils/app-error";

jest.mock("../interactions.repository");
jest.mock("../../leads/leads.model", () => ({
  LeadModel: { exists: jest.fn() },
}));

const mockInteraction = {
  _id: "507f1f77bcf86cd799439021",
  agencyId: "507f1f77bcf86cd799439012",
  leadId: "507f1f77bcf86cd799439013",
  type: "call",
  subject: "Follow-up call",
  notes: "Discussed pricing",
  performedById: "507f1f77bcf86cd799439011",
};

describe("InteractionsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listByAgency", () => {
    it("should return paginated interactions for agency", async () => {
      const listResult = { data: [mockInteraction], total: 1 };
      (InteractionsRepository.listByAgency as jest.Mock).mockResolvedValue(listResult);

      const result = await InteractionsService.listByAgency("agency1");

      expect(InteractionsRepository.listByAgency).toHaveBeenCalledWith(
        "agency1",
        1,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(listResult);
    });

    it("should pass page and limit", async () => {
      (InteractionsRepository.listByAgency as jest.Mock).mockResolvedValue({ data: [], total: 0 });

      await InteractionsService.listByAgency("agency1", 2, 25);

      expect(InteractionsRepository.listByAgency).toHaveBeenCalledWith(
        "agency1",
        2,
        25,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });
  });

  describe("listByUser", () => {
    it("should return paginated interactions for user", async () => {
      const listResult = { data: [mockInteraction], total: 1 };
      (InteractionsRepository.listByUser as jest.Mock).mockResolvedValue(listResult);

      const result = await InteractionsService.listByUser("userId", "agency1");

      expect(InteractionsRepository.listByUser).toHaveBeenCalledWith(
        "userId",
        "agency1",
        1,
        50,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(listResult);
    });
  });

  describe("listByLead", () => {
    it("should return paginated interactions for lead", async () => {
      const listResult = { data: [mockInteraction], total: 1 };
      (InteractionsRepository.listByLead as jest.Mock).mockResolvedValue(listResult);

      const result = await InteractionsService.listByLead("leadId", "agency1");

      expect(InteractionsRepository.listByLead).toHaveBeenCalledWith("leadId", "agency1", 1, 50);
      expect(result).toEqual(listResult);
    });
  });

  describe("create", () => {
    it("should create interaction when lead exists", async () => {
      (LeadModel.exists as jest.Mock).mockResolvedValue({ _id: "leadId" });
      (InteractionsRepository.create as jest.Mock).mockResolvedValue(mockInteraction);

      const data = {
        leadId: "leadId",
        agencyId: "agency1",
        type: "call" as const,
        performedById: "userId",
      } as unknown as Partial<IInteraction>;
      const result = await InteractionsService.create(data);

      expect(LeadModel.exists).toHaveBeenCalledWith({ _id: "leadId", agencyId: "agency1" });
      expect(InteractionsRepository.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(mockInteraction);
    });

    it("should throw NotFoundError when lead does not exist", async () => {
      (LeadModel.exists as jest.Mock).mockResolvedValue(null);

      const data = {
        leadId: "badLead",
        agencyId: "agency1",
        type: "call" as const,
        performedById: "userId",
      } as unknown as Partial<IInteraction>;

      await expect(InteractionsService.create(data)).rejects.toThrow(AppError);
      await expect(InteractionsService.create(data)).rejects.toMatchObject({ statusCode: 404 });
      expect(InteractionsRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update interaction when it exists", async () => {
      const updated = { ...mockInteraction, notes: "Updated notes" };
      (InteractionsRepository.findById as jest.Mock).mockResolvedValue(mockInteraction);
      (InteractionsRepository.update as jest.Mock).mockResolvedValue(updated);

      const result = await InteractionsService.update(
        "id1",
        "agency1",
        mockInteraction.performedById,
        "agent",
        { notes: "Updated notes" },
      );

      expect(InteractionsRepository.findById).toHaveBeenCalledWith("id1", "agency1");
      expect(InteractionsRepository.update).toHaveBeenCalledWith("id1", "agency1", {
        notes: "Updated notes",
      });
      expect(result).toEqual(updated);
    });

    it("should return null when interaction not found", async () => {
      (InteractionsRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await InteractionsService.update("id1", "agency1", "user1", "manager", {
        notes: "Updated",
      });

      expect(result).toBeNull();
      expect(InteractionsRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delegate to repository delete", async () => {
      (InteractionsRepository.delete as jest.Mock).mockResolvedValue(true);

      const result = await InteractionsService.delete("id1", "agency1", "user1", "manager");

      expect(InteractionsRepository.delete).toHaveBeenCalledWith("id1", "agency1");
      expect(result).toBe(true);
    });
  });
});
