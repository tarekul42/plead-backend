import { PropertiesController } from "../properties.controller";
import { PropertiesService } from "../properties.service";
import { NotFoundError } from "../../../core/utils/app-error";

jest.mock("../properties.service");

const MockedService = PropertiesService as jest.Mocked<typeof PropertiesService>;

const AGENCY_ID = "64b7f0c2e1a2b3c4d5e6f701";

interface MockResponse {
  statusCode: number | null;
  body: unknown;
  status(code: number): MockResponse;
  json(body: unknown): MockResponse;
}

function mockRes(): MockResponse {
  const res: MockResponse = {
    statusCode: null,
    body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(body) {
      res.body = body;
      return res;
    },
  };
  return res;
}

function mockReq(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    user: { agencyId: AGENCY_ID },
    params: {},
    query: {},
    body: {},
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PropertiesController.list", () => {
  it("returns 200 with data and pagination meta", async () => {
    const req = mockReq({ query: { page: "2", limit: "12" } });
    const res = mockRes();
    const data = [{ slug: "home-1" }];
    MockedService.list.mockResolvedValue({ data, total: 24 } as never);

    await PropertiesController.list(req as never, res as never, jest.fn());

    expect(res.statusCode).toBeNull();
    expect(res.body).toEqual({
      success: true,
      data,
      meta: { page: 2, limit: 12, total: 24, totalPages: 2 },
    });
    expect(MockedService.list).toHaveBeenCalledWith(
      expect.objectContaining({ page: "2", limit: "12" }),
      AGENCY_ID,
    );
  });
});

describe("PropertiesController.getBySlug", () => {
  it("returns 200 with the property", async () => {
    const req = mockReq({ params: { slug: "modern-home" } });
    const res = mockRes();
    const property = { slug: "modern-home" };
    MockedService.getBySlug.mockResolvedValue(property as never);

    await PropertiesController.getBySlug(req as never, res as never, jest.fn());

    expect(res.body).toEqual({ success: true, data: property });
    expect(MockedService.getBySlug).toHaveBeenCalledWith("modern-home", AGENCY_ID);
  });

  it("propagates NotFoundError when the property is missing", async () => {
    const req = mockReq({ params: { slug: "missing" } });
    const res = mockRes();
    const next = jest.fn();
    MockedService.getBySlug.mockResolvedValue(null);

    await PropertiesController.getBySlug(req as never, res as never, next);

    expect(next).toHaveBeenCalledWith(NotFoundError("Property"));
  });
});

describe("PropertiesController.getById", () => {
  it("returns 200 with the property", async () => {
    const req = mockReq({ params: { id: "64b7f0c2e1a2b3c4d5e6f702" } });
    const res = mockRes();
    const property = { id: "64b7f0c2e1a2b3c4d5e6f702" };
    MockedService.getById.mockResolvedValue(property as never);

    await PropertiesController.getById(req as never, res as never, jest.fn());

    expect(res.body).toEqual({ success: true, data: property });
  });

  it("propagates NotFoundError when the property is missing", async () => {
    const req = mockReq({ params: { id: "64b7f0c2e1a2b3c4d5e6f702" } });
    const res = mockRes();
    const next = jest.fn();
    MockedService.getById.mockResolvedValue(null);

    await PropertiesController.getById(req as never, res as never, next);

    expect(next).toHaveBeenCalledWith(NotFoundError("Property"));
  });
});

describe("PropertiesController.create", () => {
  it("returns 201 with the created property", async () => {
    const req = mockReq({ body: { title: "New Home" } });
    const res = mockRes();
    const property = { slug: "new-home" };
    MockedService.create.mockResolvedValue(property as never);

    await PropertiesController.create(req as never, res as never, jest.fn());

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ success: true, data: property });
    expect(MockedService.create).toHaveBeenCalledWith({ title: "New Home", agencyId: AGENCY_ID });
  });
});

describe("PropertiesController.update", () => {
  it("returns 200 with the updated property", async () => {
    const req = mockReq({ params: { id: "64b7f0c2e1a2b3c4d5e6f702" }, body: { title: "Updated" } });
    const res = mockRes();
    const property = { id: "64b7f0c2e1a2b3c4d5e6f702", title: "Updated" };
    MockedService.update.mockResolvedValue(property as never);

    await PropertiesController.update(req as never, res as never, jest.fn());

    expect(res.body).toEqual({ success: true, data: property });
    expect(MockedService.update).toHaveBeenCalledWith(
      "64b7f0c2e1a2b3c4d5e6f702",
      AGENCY_ID,
      { title: "Updated" },
    );
  });

  it("propagates NotFoundError when the property is missing", async () => {
    const req = mockReq({ params: { id: "64b7f0c2e1a2b3c4d5e6f702" }, body: {} });
    const res = mockRes();
    const next = jest.fn();
    MockedService.update.mockResolvedValue(null);

    await PropertiesController.update(req as never, res as never, next);

    expect(next).toHaveBeenCalledWith(NotFoundError("Property"));
  });
});

describe("PropertiesController.delete", () => {
  it("returns 200 with a deleted flag", async () => {
    const req = mockReq({ params: { id: "64b7f0c2e1a2b3c4d5e6f702" } });
    const res = mockRes();
    MockedService.delete.mockResolvedValue(true);

    await PropertiesController.delete(req as never, res as never, jest.fn());

    expect(res.body).toEqual({ success: true, data: { deleted: true } });
    expect(MockedService.delete).toHaveBeenCalledWith("64b7f0c2e1a2b3c4d5e6f702", AGENCY_ID);
  });

  it("propagates NotFoundError when the property is missing", async () => {
    const req = mockReq({ params: { id: "64b7f0c2e1a2b3c4d5e6f702" } });
    const res = mockRes();
    const next = jest.fn();
    MockedService.delete.mockResolvedValue(false);

    await PropertiesController.delete(req as never, res as never, next);

    expect(next).toHaveBeenCalledWith(NotFoundError("Property"));
  });
});

describe("PropertiesController.related", () => {
  it("returns 200 with related properties", async () => {
    const req = mockReq({ params: { id: "64b7f0c2e1a2b3c4d5e6f702" } });
    const res = mockRes();
    const related = [{ slug: "related-1" }, { slug: "related-2" }];
    MockedService.getRelated.mockResolvedValue(related as never);

    await PropertiesController.related(req as never, res as never, jest.fn());

    expect(res.body).toEqual({ success: true, data: related });
    expect(MockedService.getRelated).toHaveBeenCalledWith("64b7f0c2e1a2b3c4d5e6f702", AGENCY_ID);
  });
});
