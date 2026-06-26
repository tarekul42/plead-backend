import { Request, Response } from "express";

const mockVerify = jest.fn();
jest.mock("svix", () => ({
  Webhook: jest.fn(() => ({ verify: mockVerify })),
}));

jest.mock("../../../core/config/env", () => ({
  env: { CLERK_WEBHOOK_SECRET: "whsec_dummy" },
}));

const mockHandleUserCreated = jest.fn();
const mockHandleUserUpdated = jest.fn();
const mockHandleUserDeleted = jest.fn();
jest.mock("../webhooks.service", () => ({
  WebhooksService: {
    handleUserCreated: mockHandleUserCreated,
    handleUserUpdated: mockHandleUserUpdated,
    handleUserDeleted: mockHandleUserDeleted,
  },
}));

jest.mock("../../../core/utils/logger", () => ({ logger: { info: jest.fn(), error: jest.fn() } }));

import { WebhooksController } from "../webhooks.controller";

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {
      "svix-id": "svix_id",
      "svix-timestamp": "1234567890",
      "svix-signature": "v1,signature",
    },
    body: Buffer.from('{"type":"user.created","data":{"id":"clerk_1","email_addresses":[{"email_address":"a@b.com"}],"public_metadata":{"agencyId":"507f1f77bcf86cd799439011"}}}'),
    ...overrides,
  } as unknown as Request;
}
function mockRes() {
  const res: Partial<Response> = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("WebhooksController", () => {
  beforeEach(() => jest.clearAllMocks());

  it("handles user.created webhook", async () => {
    const req = mockReq(); const res = mockRes(); const next = jest.fn();
    mockVerify.mockReturnValue({ type: "user.created", data: { id: "clerk_1" } });
    mockHandleUserCreated.mockResolvedValue({});

    await WebhooksController.clerk(req, res, next);
    expect(mockHandleUserCreated).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("handles user.updated webhook", async () => {
    const req = mockReq(); const res = mockRes(); const next = jest.fn();
    mockVerify.mockReturnValue({ type: "user.updated", data: { id: "clerk_1" } });
    mockHandleUserUpdated.mockResolvedValue({});

    await WebhooksController.clerk(req, res, next);
    expect(mockHandleUserUpdated).toHaveBeenCalled();
  });

  it("handles user.deleted webhook", async () => {
    const req = mockReq(); const res = mockRes(); const next = jest.fn();
    mockVerify.mockReturnValue({ type: "user.deleted", data: { id: "clerk_1" } });
    mockHandleUserDeleted.mockResolvedValue({});

    await WebhooksController.clerk(req, res, next);
    expect(mockHandleUserDeleted).toHaveBeenCalled();
  });

  it("returns 400 when Svix headers are missing", async () => {
    const req = mockReq({ headers: {} });
    const res = mockRes(); const next = jest.fn();

    await WebhooksController.clerk(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 on invalid signature", async () => {
    const req = mockReq(); const res = mockRes(); const next = jest.fn();
    mockVerify.mockImplementation(() => { throw new Error("bad sig"); });

    await WebhooksController.clerk(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 500 on handler error", async () => {
    const req = mockReq(); const res = mockRes(); const next = jest.fn();
    mockVerify.mockReturnValue({ type: "user.created", data: { id: "clerk_1" } });
    mockHandleUserCreated.mockRejectedValue(new Error("handler failed"));

    await WebhooksController.clerk(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
