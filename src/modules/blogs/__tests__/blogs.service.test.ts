jest.mock("../blogs.repository", () => ({
  BlogsRepository: {
    list: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../blogs.model", () => ({}));

import { BlogsService } from "../blogs.service";

describe("BlogsService", () => {
  let repo: Record<string, jest.Mock>;
  beforeEach(() => {
    repo = jest.requireMock("../blogs.repository").BlogsRepository;
    jest.clearAllMocks();
  });

  it("list delegates", async () => {
    repo.list.mockResolvedValue({ data: [], total: 0 });
    expect(await BlogsService.list("ag_1")).toEqual({ data: [], total: 0 });
  });

  it("getById delegates", async () => {
    repo.findById.mockResolvedValue({ _id: "abc" });
    expect(await BlogsService.getById("abc", "ag_1")).toEqual({ _id: "abc" });
  });

  it("getBySlug delegates", async () => {
    repo.findBySlug.mockResolvedValue({ slug: "post-1" });
    expect(await BlogsService.getBySlug("post-1", "ag_1")).toEqual({ slug: "post-1" });
  });

  it("create generates slug", async () => {
    repo.findBySlug.mockResolvedValue(null);
    repo.create.mockResolvedValue({ title: "My Post", slug: "my-post" });
    const result = await BlogsService.create({ title: "My Post", agencyId: "ag_1" } as any);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ slug: "my-post" }));
  });

  it("create handles slug collision", async () => {
    repo.findBySlug
      .mockResolvedValueOnce({ slug: "my-post" })
      .mockResolvedValueOnce(null);
    repo.create.mockResolvedValue({ title: "My Post", slug: expect.any(String) });

    const result = await BlogsService.create({ title: "My Post", agencyId: "ag_1" } as any);
    expect(result.slug).not.toBe("my-post");
    expect(repo.findBySlug).toHaveBeenCalledTimes(2);
  });

  it("create sets publishedAt when status is published", async () => {
    repo.findBySlug.mockResolvedValue(null);
    repo.create.mockResolvedValue({ status: "published", publishedAt: expect.any(Date) });
    await BlogsService.create({ title: "Post", agencyId: "ag_1", status: "published" } as any);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ publishedAt: expect.any(Date) }));
  });

  it("update returns null when not found", async () => {
    repo.findById.mockResolvedValue(null);
    expect(await BlogsService.update("abc", "ag_1", {})).toBeNull();
  });

  it("update sets publishedAt when transitioning to published", async () => {
    repo.findById.mockResolvedValue({ _id: "abc", publishedAt: null });
    repo.update.mockResolvedValue({ status: "published", publishedAt: expect.any(Date) });
    const result = await BlogsService.update("abc", "ag_1", { status: "published" } as any);
    expect(repo.update).toHaveBeenCalledWith("abc", "ag_1", expect.objectContaining({ publishedAt: expect.any(Date) }));
  });

  it("delete delegates", async () => {
    repo.delete.mockResolvedValue(true);
    expect(await BlogsService.delete("abc", "ag_1")).toBe(true);
  });
});
