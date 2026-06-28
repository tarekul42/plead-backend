jest.mock("../agencies.repository", () => ({
  AgenciesRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../agencies.model", () => ({}));

import { AgenciesService } from "../agencies.service";

describe("AgenciesService", () => {
  let repo: Record<string, jest.Mock>;
  beforeEach(() => {
    repo = jest.requireMock("../agencies.repository").AgenciesRepository;
    jest.clearAllMocks();
  });

  it("list delegates", async () => {
    repo.findAll.mockResolvedValue({ data: [], total: 0 });
    expect(await AgenciesService.list("agency-id", 1, 20)).toEqual({ data: [], total: 0 });
  });

  it("getById delegates", async () => {
    repo.findById.mockResolvedValue({ _id: "abc" });
    expect(await AgenciesService.getById("abc", "abc")).toEqual({ _id: "abc" });
  });

  it("getById rejects cross-agency access", async () => {
    await expect(AgenciesService.getById("other-agency", "my-agency")).rejects.toThrow(
      "You can only access your own agency",
    );
  });

  it("create generates slug", async () => {
    repo.findBySlug.mockResolvedValue(null);
    repo.create.mockResolvedValue({ name: "My Agency", slug: "my-agency" });
    await AgenciesService.create({ name: "My Agency" } as any);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ slug: "my-agency" }));
  });

  it("create handles slug collision", async () => {
    repo.findBySlug.mockResolvedValueOnce({ slug: "my-agency" }).mockResolvedValueOnce(null);
    repo.create.mockResolvedValue({ name: "My Agency", slug: expect.any(String) });

    const result = await AgenciesService.create({ name: "My Agency" } as any);
    expect(result.slug).not.toBe("my-agency");
    expect(repo.findBySlug).toHaveBeenCalledTimes(2);
  });

  it("update delegates", async () => {
    repo.update.mockResolvedValue({ _id: "abc", name: "Updated" });
    expect(await AgenciesService.update("abc", "abc", { name: "Updated" })).toEqual({
      _id: "abc",
      name: "Updated",
    });
  });

  it("update rejects cross-agency access", async () => {
    await expect(AgenciesService.update("other", "mine", { name: "x" })).rejects.toThrow(
      "You can only modify your own agency",
    );
  });

  it("delete delegates", async () => {
    repo.delete.mockResolvedValue(true);
    expect(await AgenciesService.delete("abc", "abc")).toBe(true);
  });

  it("delete rejects cross-agency access", async () => {
    await expect(AgenciesService.delete("other", "mine")).rejects.toThrow(
      "You can only delete your own agency",
    );
  });
});
