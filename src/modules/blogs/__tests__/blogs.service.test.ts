import { BlogsService } from "../blogs.service";
import { BlogsRepository } from "../blogs.repository";
import { IBlog } from "../blogs.model";

jest.mock("../blogs.repository");

const mockBlog = {
  _id: "507f1f77bcf86cd799439041",
  agencyId: "507f1f77bcf86cd799439012",
  title: "My First Post",
  slug: "my-first-post",
  content: "Hello world",
  authorId: "507f1f77bcf86cd799439011",
  status: "draft",
  tags: [],
};

describe("BlogsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should return paginated blogs for agency", async () => {
      const listResult = { data: [mockBlog], total: 1 };
      (BlogsRepository.list as jest.Mock).mockResolvedValue(listResult);

      const result = await BlogsService.list("agency1");

      expect(BlogsRepository.list).toHaveBeenCalledWith("agency1", undefined, 1, 10);
      expect(result).toEqual(listResult);
    });

    it("should pass status filter and pagination", async () => {
      (BlogsRepository.list as jest.Mock).mockResolvedValue({ data: [], total: 0 });

      await BlogsService.list("agency1", "published", 2, 5);

      expect(BlogsRepository.list).toHaveBeenCalledWith("agency1", "published", 2, 5);
    });
  });

  describe("getById", () => {
    it("should return blog by id and agencyId", async () => {
      (BlogsRepository.findById as jest.Mock).mockResolvedValue(mockBlog);

      const result = await BlogsService.getById("id1", "agency1");

      expect(BlogsRepository.findById).toHaveBeenCalledWith("id1", "agency1");
      expect(result).toEqual(mockBlog);
    });

    it("should return null when blog not found", async () => {
      (BlogsRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await BlogsService.getById("nonexistent", "agency1");

      expect(result).toBeNull();
    });
  });

  describe("getBySlug", () => {
    it("should return blog by slug and agencyId", async () => {
      (BlogsRepository.findBySlug as jest.Mock).mockResolvedValue(mockBlog);

      const result = await BlogsService.getBySlug("my-first-post", "agency1");

      expect(BlogsRepository.findBySlug).toHaveBeenCalledWith("my-first-post", "agency1");
      expect(result).toEqual(mockBlog);
    });

    it("should return null when slug not found", async () => {
      (BlogsRepository.findBySlug as jest.Mock).mockResolvedValue(null);

      const result = await BlogsService.getBySlug("nonexistent", "agency1");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should generate slug from title and create blog", async () => {
      (BlogsRepository.findBySlug as jest.Mock).mockResolvedValue(null);
      (BlogsRepository.create as jest.Mock).mockResolvedValue(mockBlog);

      const data = { title: "My First Post", content: "Hello", agencyId: "507f1f77bcf86cd799439012", authorId: "507f1f77bcf86cd799439011" } as unknown as Partial<IBlog>;
      const result = await BlogsService.create(data);

      expect(BlogsRepository.findBySlug).toHaveBeenCalledWith("my-first-post", "507f1f77bcf86cd799439012");
      expect(BlogsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: "my-first-post" }),
      );
      expect(result).toEqual(mockBlog);
    });

    it("should generate unique slug when slug already exists", async () => {
      (BlogsRepository.findBySlug as jest.Mock).mockResolvedValueOnce(mockBlog).mockResolvedValueOnce(null);
      (BlogsRepository.create as jest.Mock).mockResolvedValue({ ...mockBlog, slug: "my-first-post-1234" });

      const data = { title: "My First Post", content: "Hello", agencyId: "507f1f77bcf86cd799439012", authorId: "507f1f77bcf86cd799439011" } as unknown as Partial<IBlog>;
      const result = await BlogsService.create(data);

      expect(BlogsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: expect.stringMatching(/^my-first-post-\d+$/),
        }),
      );
    });

    it("should use 'post' as base slug when title is empty", async () => {
      (BlogsRepository.findBySlug as jest.Mock).mockResolvedValue(null);
      (BlogsRepository.create as jest.Mock).mockResolvedValue({ ...mockBlog, slug: "post" });

      const data = { title: "", content: "Hello", agencyId: "507f1f77bcf86cd799439012", authorId: "507f1f77bcf86cd799439011" } as unknown as Partial<IBlog>;
      await BlogsService.create(data);

      expect(BlogsRepository.findBySlug).toHaveBeenCalledWith("post", "507f1f77bcf86cd799439012");
      expect(BlogsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: "post" }),
      );
    });

    it("should set publishedAt when status is published", async () => {
      (BlogsRepository.findBySlug as jest.Mock).mockResolvedValue(null);
      (BlogsRepository.create as jest.Mock).mockImplementation((d) => d);

      const data = { title: "Published Post", content: "Hello", agencyId: "507f1f77bcf86cd799439012", authorId: "507f1f77bcf86cd799439011", status: "published" as const } as unknown as Partial<IBlog>;
      const result = await BlogsService.create(data);

      expect(result.publishedAt).toBeInstanceOf(Date);
    });

    it("should not set publishedAt when status is draft", async () => {
      (BlogsRepository.findBySlug as jest.Mock).mockResolvedValue(null);
      (BlogsRepository.create as jest.Mock).mockImplementation((d) => d);

      const data = { title: "Draft Post", content: "Hello", agencyId: "507f1f77bcf86cd799439012", authorId: "507f1f77bcf86cd799439011", status: "draft" as const } as unknown as Partial<IBlog>;
      const result = await BlogsService.create(data);

      expect(result.publishedAt).toBeUndefined();
    });

    it("should skip slug uniqueness check when agencyId is empty", async () => {
      (BlogsRepository.create as jest.Mock).mockImplementation((d) => d);

      const data = { title: "No Agency", content: "Hello", authorId: "507f1f77bcf86cd799439011" } as unknown as Partial<IBlog>;
      const result = await BlogsService.create(data);

      expect(BlogsRepository.findBySlug).not.toHaveBeenCalled();
      expect(result.slug).toBe("no-agency");
    });
  });

  describe("update", () => {
    it("should update blog when it exists", async () => {
      const updated = { ...mockBlog, title: "Updated Title" };
      (BlogsRepository.findById as jest.Mock).mockResolvedValue(mockBlog);
      (BlogsRepository.update as jest.Mock).mockResolvedValue(updated);

      const result = await BlogsService.update("id1", "agency1", { title: "Updated Title" });

      expect(BlogsRepository.findById).toHaveBeenCalledWith("id1", "agency1");
      expect(BlogsRepository.update).toHaveBeenCalledWith("id1", "agency1", { title: "Updated Title" });
      expect(result).toEqual(updated);
    });

    it("should return null when blog not found", async () => {
      (BlogsRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await BlogsService.update("nonexistent", "agency1", { title: "New Title" });

      expect(result).toBeNull();
      expect(BlogsRepository.update).not.toHaveBeenCalled();
    });

    it("should set publishedAt when publishing a draft for the first time", async () => {
      const draftBlog = { ...mockBlog, status: "draft", publishedAt: undefined };
      (BlogsRepository.findById as jest.Mock).mockResolvedValue(draftBlog);
      (BlogsRepository.update as jest.Mock).mockImplementation((_id, _agencyId, data) => data);

      const result = await BlogsService.update("id1", "agency1", { status: "published" });

      expect(BlogsRepository.update).toHaveBeenCalledWith(
        "id1",
        "agency1",
        expect.objectContaining({ status: "published", publishedAt: expect.any(Date) }),
      );
    });

    it("should not overwrite publishedAt if already set", async () => {
      const existingDate = new Date("2025-01-01");
      const publishedBlog = { ...mockBlog, status: "published", publishedAt: existingDate };
      (BlogsRepository.findById as jest.Mock).mockResolvedValue(publishedBlog);
      (BlogsRepository.update as jest.Mock).mockImplementation((_id, _agencyId, data) => data);

      await BlogsService.update("id1", "agency1", { title: "Updated" });

      expect(BlogsRepository.update).toHaveBeenCalledWith(
        "id1",
        "agency1",
        expect.not.objectContaining({ publishedAt: expect.any(Date) }),
      );
    });
  });

  describe("delete", () => {
    it("should delegate to repository delete", async () => {
      (BlogsRepository.delete as jest.Mock).mockResolvedValue(true);

      const result = await BlogsService.delete("id1", "agency1");

      expect(BlogsRepository.delete).toHaveBeenCalledWith("id1", "agency1");
      expect(result).toBe(true);
    });

    it("should return false when blog not found", async () => {
      (BlogsRepository.delete as jest.Mock).mockResolvedValue(false);

      const result = await BlogsService.delete("nonexistent", "agency1");

      expect(result).toBe(false);
    });
  });
});
