import { ReviewsService } from "../reviews.service";
import { ReviewsRepository } from "../reviews.repository";
import { IReview } from "../reviews.model";

jest.mock("../reviews.repository");
jest.mock("../../properties/properties.model", () => ({
  PropertyModel: {
    exists: jest.fn(),
  },
}));

const mockReview = {
  _id: "507f1f77bcf86cd799439031",
  agencyId: "507f1f77bcf86cd799439012",
  propertyId: "507f1f77bcf86cd799439014",
  userId: "507f1f77bcf86cd799439011",
  rating: 5,
  title: "Great property",
  comment: "Amazing experience",
  isVerified: false,
};

describe("ReviewsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { PropertyModel } = jest.requireMock("../../properties/properties.model");
    PropertyModel.exists.mockResolvedValue(true);
  });

  describe("listByAgency", () => {
    it("should return paginated reviews for agency", async () => {
      const listResult = { data: [mockReview], total: 1 };
      (ReviewsRepository.listByAgency as jest.Mock).mockResolvedValue(listResult);

      const result = await ReviewsService.listByAgency("agency1");

      expect(ReviewsRepository.listByAgency).toHaveBeenCalledWith("agency1", undefined, 1, 50);
      expect(result).toEqual(listResult);
    });

    it("should pass isVerified filter", async () => {
      (ReviewsRepository.listByAgency as jest.Mock).mockResolvedValue({ data: [], total: 0 });

      await ReviewsService.listByAgency("agency1", "true", 2, 25);

      expect(ReviewsRepository.listByAgency).toHaveBeenCalledWith("agency1", "true", 2, 25);
    });
  });

  describe("listByProperty", () => {
    it("should return paginated reviews for property", async () => {
      const listResult = { data: [mockReview], total: 1 };
      (ReviewsRepository.listByProperty as jest.Mock).mockResolvedValue(listResult);

      const result = await ReviewsService.listByProperty("property1", "agency1");

      expect(ReviewsRepository.listByProperty).toHaveBeenCalledWith("property1", "agency1", 1, 50);
      expect(result).toEqual(listResult);
    });

    it("should pass page and limit", async () => {
      (ReviewsRepository.listByProperty as jest.Mock).mockResolvedValue({ data: [], total: 0 });

      await ReviewsService.listByProperty("property1", "agency1", 3, 10);

      expect(ReviewsRepository.listByProperty).toHaveBeenCalledWith("property1", "agency1", 3, 10);
    });
  });

  describe("create", () => {
    it("should create and return a review", async () => {
      (ReviewsRepository.create as jest.Mock).mockResolvedValue(mockReview);

      const data = {
        agencyId: "agency1",
        propertyId: "prop1",
        userId: "user1",
        rating: 5,
      } as unknown as Partial<IReview>;
      const result = await ReviewsService.create(data);

      expect(ReviewsRepository.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(mockReview);
    });
  });

  describe("update", () => {
    it("should update review when it exists", async () => {
      const updated = { ...mockReview, rating: 4, comment: "Updated comment" };
      (ReviewsRepository.findById as jest.Mock).mockResolvedValue(mockReview);
      (ReviewsRepository.update as jest.Mock).mockResolvedValue(updated);

      const result = await ReviewsService.update("id1", "agency1", mockReview.userId, "agent", {
        rating: 4,
        comment: "Updated comment",
      });

      expect(ReviewsRepository.findById).toHaveBeenCalledWith("id1", "agency1");
      expect(ReviewsRepository.update).toHaveBeenCalledWith("id1", "agency1", {
        rating: 4,
        comment: "Updated comment",
      });
      expect(result).toEqual(updated);
    });

    it("should return null when review not found", async () => {
      (ReviewsRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await ReviewsService.update("nonexistent", "agency1", "user1", "manager", {
        rating: 3,
      });

      expect(result).toBeNull();
      expect(ReviewsRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delegate to repository delete", async () => {
      (ReviewsRepository.delete as jest.Mock).mockResolvedValue(true);

      const result = await ReviewsService.delete("id1", "agency1", "user1", "manager");

      expect(ReviewsRepository.delete).toHaveBeenCalledWith("id1", "agency1");
      expect(result).toBe(true);
    });

    it("should return false when review not found", async () => {
      (ReviewsRepository.delete as jest.Mock).mockResolvedValue(false);

      const result = await ReviewsService.delete("nonexistent", "agency1", "user1", "manager");

      expect(result).toBe(false);
    });
  });
});
