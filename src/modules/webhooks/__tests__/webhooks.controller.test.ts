import { Request, Response } from "express";

const mockVerify = jest.fn();
jest.mock("svix", () => ({
  Webhook: jest.fn(() => ({ verify: mockVerify })),
}));

jest.mock("../../../core/config/env", () => ({
  env: { CLERK_WEBHOOK_SECRET: "whsec_dummy" },
}));

jest.mock("../webhooks.service", () => ({
  WebhooksService: {
    handleUserCreated: jest.fn(),
    handleUserUpdated: jest.fn(),
    handleUserDeleted: jest.fn(),
  },
}));

import { WebhooksController } from "../webhooks.controller";

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    body: {},
    params: {}, query: {}, user: undefined,
    ...overrides,
  } as unknown as Request;
}
function mockRes() {
  const res: Partial<Response> = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res as Response;
}

const validHeaders = {
  "svix-id": "svix_id_1",
  "svix-timestamp": "1700000000",
  "svix-signature": "svix_sig_1",
};

describe("WebhooksController.clerk", () => {
  let svc: Record<string, jest.Mock>;
  beforeEach(() => {
    svc = jest.requireMock("../webhooks.service").WebhooksService;
    jest.clearAllMocks();
  });

  it("returns 400 when Svix headers are missing", async () => {
    const req = mockReq({ headers: {} });
    const res = mockRes();
    const next = jest.fn();

    await WebhooksController.clerk(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: "WEBHOOK_INVALID" }),
    }));
    expect(mockVerify).not.toHaveBeenCalled();
  });

  it("returns 400 when signature verification fails", async () => {
    mockVerify.mockImplementation(() => {
      throw new Error("bad sig");
    });
    const req = mockReq({ headers: validHeaders, body: { type: "user.created", data: {} } });
    const res = mockRes();
    const next = jest.fn();

    await WebhooksController.clerk(req, res, next);

    expect(mockVerify).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: "WEBHOOK_INVALID" }),
    }));
  });

  it("routes user.created to handleUserCreated", async () => {
    const data = { id: "u1", email_addresses: [{ email_address: "a@b.com" }] };
    mockVerify.mockReturnValue({ type: "user.created", data });
    const req = mockReq({ headers: validHeaders, body: {} });
    const res = mockRes();
    const next = jest.fn();

    await WebhooksController.clerk(req, res, next);

    expect(svc.handleUserCreated).toHaveBeenCalledWith(data);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("routes user.updated to handleUserUpdated", async () => {
    const data = { id: "u1", email_addresses: [{ email_address: "a@b.com" }] };
    mockVerify.mockReturnValue({ type: "user.updated", data });
    const req = mockReq({ headers: validHeaders, body: {} });
    const res = mockRes();
    const next = jest.fn();

    await WebhooksController.clerk(req, res, next);

    expect(svc.handleUserUpdated).toHaveBeenCalledWith(data);
  });

  it("routes user.deleted to handleUserDeleted", async () => {
    const data = { id: "u1" };
    mockVerify.mockReturnValue({ type: "user.deleted", data });
    const req = mockReq({ headers: validHeaders, body: {} });
    const res = mockRes();
    const next = jest.fn();

    await WebhooksController.clerk(req, res, next);

    expect(svc.handleUserDeleted).toHaveBeenCalledWith(data);
  });

  it("handles unknown event types without error", async () => {
    mockVerify.mockReturnValue({ type: "organization.created", data: { id: "o1" } });
    const req = mockReq({ headers: validHeaders, body: {} });
    const res = mockRes();
    const next = jest.fn();

    await WebhooksController.clerk(req, res, next);

    expect(svc.handleUserCreated).not.toHaveBeenCalled();
    expect(svc.handleUserUpdated).not.toHaveBeenCalled();
    expect(svc.handleUserDeleted).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("returns 500 when the handler throws", async () => {
    const data = { id: "u1", email_addresses: [{ email_address: "a@b.com" }] };
    mockVerify.mockReturnValue({ type: "user.created", data });
    svc.handleUserCreated.mockRejectedValue(new Error("boom"));
    const req = mockReq({ headers: validHeaders, body: {} });
    const res = mockRes();
    const next = jest.fn();

    await WebhooksController.clerk(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: "WEBHOOK_ERROR" }),
    }));
  });
});
