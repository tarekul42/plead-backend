import { UsersService } from "../users.service";
import { UsersRepository } from "../users.repository";
import { IUser } from "../users.model";

jest.mock("../users.repository");

const mockUser = {
  _id: "507f1f77bcf86cd799439011",
  clerkId: "clerk_123",
  email: "john@example.com",
  name: "John Doe",
  role: "agent",
  agencyId: "507f1f77bcf86cd799439012",
  isActive: true,
};

describe("UsersService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getByClerkId", () => {
    it("should return user by clerkId", async () => {
      (UsersRepository.findByClerkId as jest.Mock).mockResolvedValue(mockUser);

      const result = await UsersService.getByClerkId("clerk_123");

      expect(UsersRepository.findByClerkId).toHaveBeenCalledWith("clerk_123");
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      (UsersRepository.findByClerkId as jest.Mock).mockResolvedValue(null);

      const result = await UsersService.getByClerkId("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getById", () => {
    it("should return user by id", async () => {
      (UsersRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await UsersService.getById("507f1f77bcf86cd799439011");

      expect(UsersRepository.findById).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      (UsersRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await UsersService.getById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create and return a user", async () => {
      const data = { clerkId: "clerk_123", email: "john@example.com", name: "John Doe", role: "agent" as const, agencyId: "507f1f77bcf86cd799439012" } as unknown as Partial<IUser>;
      (UsersRepository.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await UsersService.create(data);

      expect(UsersRepository.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(mockUser);
    });
  });

  describe("update", () => {
    it("should update user by clerkId", async () => {
      const updated = { ...mockUser, name: "Jane Doe" };
      (UsersRepository.update as jest.Mock).mockResolvedValue(updated);

      const result = await UsersService.update("clerk_123", { name: "Jane Doe" });

      expect(UsersRepository.update).toHaveBeenCalledWith("clerk_123", { name: "Jane Doe" });
      expect(result).toEqual(updated);
    });

    it("should return null when user not found", async () => {
      (UsersRepository.update as jest.Mock).mockResolvedValue(null);

      const result = await UsersService.update("nonexistent", { name: "Jane Doe" });

      expect(result).toBeNull();
    });
  });

  describe("updateById", () => {
    it("should update user by id and agencyId", async () => {
      const updated = { ...mockUser, title: "Senior Agent" };
      (UsersRepository.updateById as jest.Mock).mockResolvedValue(updated);

      const result = await UsersService.updateById("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012", { title: "Senior Agent" });

      expect(UsersRepository.updateById).toHaveBeenCalledWith("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012", { title: "Senior Agent" });
      expect(result).toEqual(updated);
    });

    it("should return null when user not found", async () => {
      (UsersRepository.updateById as jest.Mock).mockResolvedValue(null);

      const result = await UsersService.updateById("nonexistent", "agency1", { title: "Senior Agent" });

      expect(result).toBeNull();
    });
  });

  describe("listByAgency", () => {
    it("should list users by agency with defaults", async () => {
      const listResult = { data: [mockUser], total: 1 };
      (UsersRepository.listByAgency as jest.Mock).mockResolvedValue(listResult);

      const result = await UsersService.listByAgency("507f1f77bcf86cd799439012");

      expect(UsersRepository.listByAgency).toHaveBeenCalledWith("507f1f77bcf86cd799439012", 1, 50);
      expect(result).toEqual(listResult);
    });

    it("should pass page and limit to repository", async () => {
      const listResult = { data: [], total: 0 };
      (UsersRepository.listByAgency as jest.Mock).mockResolvedValue(listResult);

      await UsersService.listByAgency("agency1", 3, 25);

      expect(UsersRepository.listByAgency).toHaveBeenCalledWith("agency1", 3, 25);
    });
  });
});
