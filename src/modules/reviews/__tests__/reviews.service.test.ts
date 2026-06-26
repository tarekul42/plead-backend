jest.mock("../reviews.repository", () => ({
  ReviewsRepository: {
    listByAgency: jest.fn(),
    listByProperty: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../reviews.model", () => ({}));

import { ReviewsService } from "../reviews.service";

describe("ReviewsService", () => {
  let repo: Record<string, jest.Mock>;
  beforeEach(() => {
    repo = jest.requireMock("../reviews.repository").ReviewsRepository;
    jest.clearAllMocks();
  });

  it("listByAgency delegates", async () => {
    repo.listByAgency.mockResolvedValue({ data: [], total: 0 });
    expect(await ReviewsService.listByAgency("ag_1")).toEqual({ data: [], total: 0 });
  });

  it("listByProperty delegates", async () => {
    repo.listByProperty.mockResolvedValue({ data: [], total: 0 });
    expect(await ReviewsService.listByProperty("prop_1", "ag_1")).toEqual({ data: [], total: 0 });
  });

  it("create delegates", async () => {
    repo.create.mockResolvedValue({ _id: "new" });
    expect(await ReviewsService.create({ rating: 5 } as any)).toEqual({ _id: "new" });
  });

  it("update returns null when not found", async () => {
    repo.findById.mockResolvedValue(null);
    expect(await ReviewsService.update("abc", "ag_1", {})).toBeNull();
  });

  it("update delegates when found", async () => {
    repo.findById.mockResolvedValue({ _id: "abc" });
    repo.update.mockResolvedValue({ _id: "abc", rating: 4 });

    const result = await ReviewsService.update("abc", "ag_1", { rating: 4 });
    expect(repo.update).toHaveBeenCalledWith("abc", "ag_1", { rating: 4 });
    expect(result).toEqual({ _id: "abc", rating: 4 });
  });

  it("delete delegates", async () => {
    repo.delete.mockResolvedValue(true);
    expect(await ReviewsService.delete("abc", "ag_1")).toBe(true);
  });
});
