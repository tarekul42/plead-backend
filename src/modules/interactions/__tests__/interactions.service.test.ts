jest.mock("../interactions.repository", () => ({
  InteractionsRepository: {
    listByAgency: jest.fn(),
    listByUser: jest.fn(),
    listByLead: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../interactions.model", () => ({}));

const mockExists = jest.fn();
jest.mock("../../leads/leads.model", () => ({ LeadModel: { exists: mockExists } }));

import { InteractionsService } from "../interactions.service";

describe("InteractionsService", () => {
  let repo: Record<string, jest.Mock>;
  beforeEach(() => {
    repo = jest.requireMock("../interactions.repository").InteractionsRepository;
    jest.clearAllMocks();
  });

  it("listByAgency delegates", async () => {
    repo.listByAgency.mockResolvedValue({ data: [], total: 0 });
    expect(await InteractionsService.listByAgency("ag_1", 1, 50)).toEqual({ data: [], total: 0 });
  });

  it("listByUser delegates", async () => {
    repo.listByUser.mockResolvedValue({ data: [], total: 0 });
    expect(await InteractionsService.listByUser("user_1", "ag_1", 1, 50)).toEqual({ data: [], total: 0 });
  });

  it("listByLead delegates", async () => {
    repo.listByLead.mockResolvedValue({ data: [], total: 0 });
    expect(await InteractionsService.listByLead("lead_1", "ag_1", 1, 50)).toEqual({ data: [], total: 0 });
  });

  it("create validates lead exists", async () => {
    mockExists.mockResolvedValue(true);
    repo.create.mockResolvedValue({ _id: "new" });
    const result = await InteractionsService.create({ leadId: "lead_1", agencyId: "ag_1" } as any);
    expect(result).toEqual({ _id: "new" });
  });

  it("create throws when lead not found", async () => {
    mockExists.mockResolvedValue(false);
    await expect(InteractionsService.create({ leadId: "lead_1", agencyId: "ag_1" } as any)).rejects.toThrow();
  });

  it("update returns null when not found", async () => {
    repo.findById.mockResolvedValue(null);
    expect(await InteractionsService.update("abc", "ag_1", {})).toBeNull();
  });

  it("update delegates when found", async () => {
    repo.findById.mockResolvedValue({ _id: "abc" });
    repo.update.mockResolvedValue({ _id: "abc", notes: "Updated" });

    const result = await InteractionsService.update("abc", "ag_1", { notes: "Updated" });
    expect(repo.update).toHaveBeenCalledWith("abc", "ag_1", { notes: "Updated" });
    expect(result).toEqual({ _id: "abc", notes: "Updated" });
  });

  it("delete delegates", async () => {
    repo.delete.mockResolvedValue(true);
    expect(await InteractionsService.delete("abc", "ag_1")).toBe(true);
  });
});
