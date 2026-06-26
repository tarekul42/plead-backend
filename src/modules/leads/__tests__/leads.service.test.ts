jest.mock("../leads.repository", () => ({
  LeadsRepository: {
    list: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../leads.model", () => ({}));

import { LeadsService } from "../leads.service";

describe("LeadsService", () => {
  let repo: Record<string, jest.Mock>;
  beforeEach(() => {
    repo = jest.requireMock("../leads.repository").LeadsRepository;
    jest.clearAllMocks();
  });

  it("list delegates to repository", async () => {
    repo.list.mockResolvedValue({ data: [], total: 0 });
    const result = await LeadsService.list({ page: 1, limit: 20 } as any, "agency_1");
    expect(repo.list).toHaveBeenCalledWith({ agencyId: "agency_1", page: 1, limit: 20 });
    expect(result).toEqual({ data: [], total: 0 });
  });

  it("getById delegates", async () => {
    repo.findById.mockResolvedValue({ _id: "abc" });
    expect(await LeadsService.getById("abc", "agency_1")).toEqual({ _id: "abc" });
  });

  it("create delegates", async () => {
    repo.create.mockResolvedValue({ _id: "new" });
    expect(await LeadsService.create({ name: "Lead" } as any)).toEqual({ _id: "new" });
  });

  it("update returns null when not found", async () => {
    repo.findById.mockResolvedValue(null);
    expect(await LeadsService.update("abc", "agency_1", { name: "X" })).toBeNull();
  });

  it("update delegates when found", async () => {
    repo.findById.mockResolvedValue({ _id: "abc" });
    repo.update.mockResolvedValue({ _id: "abc", name: "Updated" });

    const result = await LeadsService.update("abc", "agency_1", { name: "Updated" });
    expect(repo.update).toHaveBeenCalledWith("abc", "agency_1", { name: "Updated" });
    expect(result).toEqual({ _id: "abc", name: "Updated" });
  });

  it("delete delegates", async () => {
    repo.delete.mockResolvedValue(true);
    expect(await LeadsService.delete("abc", "agency_1")).toBe(true);
  });
});
