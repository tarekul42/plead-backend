const mockFindOneAndUpdate = jest.fn();
jest.mock("../../users/users.model", () => ({
  UserModel: { findOneAndUpdate: mockFindOneAndUpdate },
}));

jest.mock("../../../core/utils/logger", () => ({ logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn() } }));

import mongoose from "mongoose";
import { WebhooksService } from "../webhooks.service";

describe("WebhooksService", () => {
  beforeEach(() => jest.clearAllMocks());

  const makeData = (overrides: any = {}) => ({
    id: "clerk_123",
    email_addresses: [{ email_address: "user@test.com" }],
    first_name: "John",
    last_name: "Doe",
    image_url: "https://img.com/avatar.png",
    public_metadata: { role: "agent", agencyId: new mongoose.Types.ObjectId().toString() },
    ...overrides,
  });

  describe("handleUserCreated", () => {
    it("creates user with upsert", async () => {
      const data = makeData();
      const returned = { clerkId: "clerk_123" };
      mockFindOneAndUpdate.mockResolvedValue(returned);

      const result = await WebhooksService.handleUserCreated(data);
      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { clerkId: "clerk_123" },
        { $setOnInsert: expect.objectContaining({ email: "user@test.com" }) },
        { upsert: true, new: true },
      );
      expect(result).toEqual(returned);
    });

    it("throws when email is missing", async () => {
      const data = makeData({ email_addresses: [] });
      await expect(WebhooksService.handleUserCreated(data)).rejects.toThrow("User has no email address");
    });

    it("throws when agencyId is missing", async () => {
      const data = makeData({ public_metadata: {} });
      await expect(WebhooksService.handleUserCreated(data)).rejects.toThrow("agencyId");
    });

    it("defaults to agent role when role is invalid", async () => {
      const data = makeData({ public_metadata: { role: "superadmin", agencyId: new mongoose.Types.ObjectId().toString() } });
      mockFindOneAndUpdate.mockResolvedValue({});
      await WebhooksService.handleUserCreated(data);
      const call = mockFindOneAndUpdate.mock.calls[0][1].$setOnInsert;
      expect(call.role).toBe("agent");
    });
  });

  describe("handleUserUpdated", () => {
    it("updates user data", async () => {
      const data = makeData();
      mockFindOneAndUpdate.mockResolvedValue({});
      await WebhooksService.handleUserUpdated(data);
      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { clerkId: "clerk_123" },
        expect.objectContaining({ email: "user@test.com" }),
        { new: true },
      );
    });

    it("skips update when email is missing", async () => {
      const logger = require("../../../core/utils/logger").logger;
      const data = makeData({ email_addresses: [] });
      const result = await WebhooksService.handleUserUpdated(data);
      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalled();
    });

    it("omits unknown role from update", async () => {
      const data = makeData({ public_metadata: { role: "superadmin", agencyId: new mongoose.Types.ObjectId().toString() } });
      mockFindOneAndUpdate.mockResolvedValue({});
      await WebhooksService.handleUserUpdated(data);
      const update = mockFindOneAndUpdate.mock.calls[0][1];
      expect(update.role).toBeUndefined();
    });
  });

  describe("handleUserDeleted", () => {
    it("marks user as inactive", async () => {
      mockFindOneAndUpdate.mockResolvedValue({});
      await WebhooksService.handleUserDeleted({ id: "clerk_123" });
      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { clerkId: "clerk_123" },
        { isActive: false },
        { new: true },
      );
    });
  });
});
