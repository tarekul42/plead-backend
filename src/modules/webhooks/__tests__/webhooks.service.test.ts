const mockFindOneAndUpdate = jest.fn();
jest.mock("../../users/users.model", () => ({
  UserModel: { findOneAndUpdate: mockFindOneAndUpdate },
}));

jest.mock("mongoose", () => {
  const ObjectId = jest.fn((id: string) => id) as any;
  ObjectId.isValid = jest.fn((id: string) => /^[a-f\d]{24}$/i.test(id));
  const mMongoose = {
    Types: { ObjectId },
    connections: [{ readyState: 1 }],
    connection: { readyState: 1, on: jest.fn(), close: jest.fn() },
    model: jest.fn(),
  };
  return mMongoose;
});

jest.mock("../../../core/utils/logger", () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

import { WebhooksService } from "../webhooks.service";

const validUser = {
  id: "user_clerk123",
  email_addresses: [{ email_address: "jane@example.com" }],
  first_name: "Jane",
  last_name: "Doe",
  image_url: "https://img.example.com/jane.png",
  public_metadata: { role: "manager", agencyId: "507f1f77bcf86cd799439011" },
};

describe("WebhooksService", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("handleUserCreated", () => {
    it("upserts a user with mapped fields", async () => {
      mockFindOneAndUpdate.mockResolvedValue({ clerkId: "user_clerk123", email: "jane@example.com" });

      const result = await WebhooksService.handleUserCreated(validUser as any);

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { clerkId: "user_clerk123" },
        expect.objectContaining({
          $setOnInsert: expect.objectContaining({
            clerkId: "user_clerk123",
            email: "jane@example.com",
            name: "Jane Doe",
            avatarUrl: "https://img.example.com/jane.png",
            role: "manager",
            isActive: true,
          }),
        }),
        { upsert: true, new: true },
      );
      expect(result).toEqual({ clerkId: "user_clerk123", email: "jane@example.com" });
    });

    it("falls back to default role when role is missing", async () => {
      const noRole = { ...validUser, public_metadata: { agencyId: "507f1f77bcf86cd799439011" } };
      mockFindOneAndUpdate.mockResolvedValue({});

      await WebhooksService.handleUserCreated(noRole as any);

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          $setOnInsert: expect.objectContaining({ role: "agent" }),
        }),
        expect.anything(),
      );
    });

    it("falls back to default role when role is invalid", async () => {
      const badRole = { ...validUser, public_metadata: { role: "superadmin", agencyId: "507f1f77bcf86cd799439011" } };
      mockFindOneAndUpdate.mockResolvedValue({});

      await WebhooksService.handleUserCreated(badRole as any);

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          $setOnInsert: expect.objectContaining({ role: "agent" }),
        }),
        expect.anything(),
      );
    });

    it("builds a fallback name when names are missing", async () => {
      const noName = { ...validUser, first_name: undefined, last_name: undefined };
      mockFindOneAndUpdate.mockResolvedValue({});

      await WebhooksService.handleUserCreated(noName as any);

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          $setOnInsert: expect.objectContaining({ name: "Unknown" }),
        }),
        expect.anything(),
      );
    });

    it("throws when email is missing", async () => {
      const noEmail = { ...validUser, email_addresses: [] };
      await expect(WebhooksService.handleUserCreated(noEmail as any)).rejects.toMatchObject({
        statusCode: 400,
        code: "WEBHOOK_VALIDATION",
      });
    });

    it("throws when agencyId is missing", async () => {
      const noAgency = { ...validUser, public_metadata: { role: "agent" } };
      await expect(WebhooksService.handleUserCreated(noAgency as any)).rejects.toMatchObject({
        statusCode: 400,
        code: "WEBHOOK_VALIDATION",
      });
    });

    it("throws when agencyId is invalid", async () => {
      const badAgency = { ...validUser, public_metadata: { role: "agent", agencyId: "not-valid" } };
      await expect(WebhooksService.handleUserCreated(badAgency as any)).rejects.toMatchObject({
        statusCode: 400,
        code: "WEBHOOK_VALIDATION",
      });
    });
  });

  describe("handleUserUpdated", () => {
    it("updates user fields", async () => {
      mockFindOneAndUpdate.mockResolvedValue({ clerkId: "user_clerk123", email: "jane@example.com" });

      const result = await WebhooksService.handleUserUpdated(validUser as any);

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { clerkId: "user_clerk123" },
        expect.objectContaining({
          email: "jane@example.com",
          name: "Jane Doe",
          avatarUrl: "https://img.example.com/jane.png",
        }),
        { new: true },
      );
      expect(result).toBeTruthy();
    });

    it("returns null and logs when email is missing", async () => {
      const noEmail = { ...validUser, email_addresses: [] };

      const result = await WebhooksService.handleUserUpdated(noEmail as any);

      expect(result).toBeNull();
      expect(mockFindOneAndUpdate).not.toHaveBeenCalled();
    });

    it("performs a partial update when only name changes", async () => {
      const nameOnly = {
        id: "user_clerk123",
        email_addresses: [{ email_address: "jane@example.com" }],
        first_name: "Janet",
        last_name: undefined,
        image_url: undefined,
      };
      mockFindOneAndUpdate.mockResolvedValue({});

      await WebhooksService.handleUserUpdated(nameOnly as any);

      const [, updateArg] = mockFindOneAndUpdate.mock.calls[0];
      expect(updateArg).toEqual(
        expect.objectContaining({
          email: "jane@example.com",
          name: "Janet",
        }),
      );
      expect(updateArg).not.toHaveProperty("role");
      expect(updateArg).not.toHaveProperty("agencyId");
    });

    it("updates role and agencyId when present and valid", async () => {
      const fullMeta = {
        ...validUser,
        public_metadata: { role: "admin", agencyId: "507f1f77bcf86cd799439011" },
      };
      mockFindOneAndUpdate.mockResolvedValue({});

      await WebhooksService.handleUserUpdated(fullMeta as any);

      const [, updateArg] = mockFindOneAndUpdate.mock.calls[0];
      expect(updateArg).toEqual(
        expect.objectContaining({ role: "admin" }),
      );
      expect(updateArg.agencyId).toBeDefined();
    });
  });

  describe("handleUserDeleted", () => {
    it("soft-deactivates the user", async () => {
      mockFindOneAndUpdate.mockResolvedValue({ clerkId: "user_clerk123", isActive: false });

      const result = await WebhooksService.handleUserDeleted({ id: "user_clerk123" });

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { clerkId: "user_clerk123" },
        { isActive: false },
        { new: true },
      );
      expect(result).toEqual({ clerkId: "user_clerk123", isActive: false });
    });
  });
});
