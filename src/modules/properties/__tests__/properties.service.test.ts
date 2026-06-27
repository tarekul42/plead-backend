import { PropertiesService, ListQuery } from "../properties.service";
import { PropertiesRepository } from "../properties.repository";
import { PropertyModel, IProperty } from "../properties.model";
import { ReviewModel } from "../../reviews/reviews.model";
import { InternalError } from "../../../core/utils/app-error";

jest.mock("../properties.repository");
jest.mock("../properties.model");
jest.mock("../../reviews/reviews.model");

const MockedRepository = PropertiesRepository as jest.Mocked<typeof PropertiesRepository>;
const MockedPropertyModel = PropertyModel as jest.Mocked<typeof PropertyModel>;
const MockedReviewModel = ReviewModel as jest.Mocked<typeof ReviewModel>;

const AGENCY_ID = "64b7f0c2e1a2b3c4d5e6f701";
const PROPERTY_ID = "64b7f0c2e1a2b3c4d5e6f702";

function makeProperty(overrides: Partial<IProperty> = {}): IProperty {
  return {
    _id: PROPERTY_ID as unknown as IProperty["_id"],
    agencyId: AGENCY_ID as unknown as IProperty["agencyId"],
    title: "Modern Family Home",
    slug: "modern-family-home",
    description: "A spacious modern home.",
    price: 500000,
    location: "Austin, TX",
    images: ["img1.jpg"],
    beds: 4,
    baths: 3,
    area: 2400,
    propertyType: "house",
    status: "available",
    features: ["garage"],
    assignedAgentId: "64b7f0c2e1a2b3c4d5e6f703" as unknown as IProperty["assignedAgentId"],
    views: 0,
    inquiriesCount: 0,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as IProperty;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PropertiesService.list", () => {
  it("delegates to the repository with the given query and agencyId", async () => {
    const query: ListQuery = { page: 1, limit: 12 };
    const expected = { data: [], total: 0 };
    MockedRepository.list.mockResolvedValue(expected as never);

    const result = await PropertiesService.list(query, AGENCY_ID);

    expect(MockedRepository.list).toHaveBeenCalledWith({ ...query, agencyId: AGENCY_ID });
    expect(result).toEqual(expected);
  });
});

describe("PropertiesService.getById", () => {
  it("delegates to the repository", async () => {
    const property = makeProperty();
    MockedRepository.findById.mockResolvedValue(property);

    const result = await PropertiesService.getById(PROPERTY_ID, AGENCY_ID);

    expect(MockedRepository.findById).toHaveBeenCalledWith(PROPERTY_ID, AGENCY_ID);
    expect(result).toEqual(property);
  });
});

describe("PropertiesService.getBySlug", () => {
  it("delegates to the repository", async () => {
    const property = makeProperty();
    MockedRepository.findBySlug.mockResolvedValue(property as never);

    const result = await PropertiesService.getBySlug("modern-family-home", AGENCY_ID);

    expect(MockedRepository.findBySlug).toHaveBeenCalledWith("modern-family-home", AGENCY_ID);
    expect(result).toEqual(property);
  });
});

describe("PropertiesService.create - slug generation", () => {
  function mockLeanQuery(result: unknown) {
    return { lean: jest.fn().mockResolvedValue(result) };
  }

  beforeEach(() => {
    MockedPropertyModel.findOne.mockReturnValue(mockLeanQuery(null) as never);
    MockedRepository.create.mockImplementation(async (data) => data as never);
  });

  it("generates a slug from the title", async () => {
    const result = await PropertiesService.create({
      title: "Modern Family Home",
      agencyId: AGENCY_ID as never,
    });

    expect(result.slug).toBe("modern-family-home");
    expect(result.publishedAt).toBeInstanceOf(Date);
    expect(MockedRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "modern-family-home" }),
    );
  });

  it("collapses non-alphanumeric characters into dashes", async () => {
    const result = await PropertiesService.create({
      title: "Luxury @ Home #1!!!",
      agencyId: AGENCY_ID as never,
    });

    expect(result.slug).toBe("luxury-home-1");
  });

  it("trims leading and trailing dashes", async () => {
    const result = await PropertiesService.create({
      title: "---Spacious Condo---",
      agencyId: AGENCY_ID as never,
    });

    expect(result.slug).toBe("spacious-condo");
  });

  it("falls back to 'property' when the title yields no slug characters", async () => {
    const result = await PropertiesService.create({
      title: "!!!@@@###",
      agencyId: AGENCY_ID as never,
    });

    expect(result.slug).toBe("property");
  });

  it("appends a timestamp when the slug collides", async () => {
    MockedPropertyModel.findOne
      .mockReturnValueOnce(mockLeanQuery(makeProperty({ slug: "modern-family-home" })) as never)
      .mockReturnValueOnce(
        mockLeanQuery(makeProperty({ slug: expect.stringMatching(/^modern-family-home-\d+$/) })) as never,
      )
      .mockReturnValue(mockLeanQuery(null) as never);

    const result = await PropertiesService.create({
      title: "Modern Family Home",
      agencyId: AGENCY_ID as never,
    });

    expect(result.slug).toMatch(/^modern-family-home-\d+$/);
    expect(MockedPropertyModel.findOne).toHaveBeenCalledTimes(3);
  });

  it("sets publishedAt to a date even when not provided", async () => {
    const result = await PropertiesService.create({
      title: "Modern Family Home",
      agencyId: AGENCY_ID as never,
    });

    expect(result.publishedAt).toBeInstanceOf(Date);
  });
});

describe("PropertiesService.update", () => {
  it("returns null when the property does not exist", async () => {
    MockedRepository.findById.mockResolvedValue(null);

    const result = await PropertiesService.update(PROPERTY_ID, AGENCY_ID, { title: "New Title" });

    expect(result).toBeNull();
    expect(MockedRepository.update).not.toHaveBeenCalled();
  });

  it("delegates to the repository when the property exists", async () => {
    const existing = makeProperty();
    const updated = makeProperty({ title: "New Title" });
    MockedRepository.findById.mockResolvedValue(existing as never);
    MockedRepository.update.mockResolvedValue(updated as never);

    const result = await PropertiesService.update(PROPERTY_ID, AGENCY_ID, { title: "New Title" });

    expect(MockedRepository.update).toHaveBeenCalledWith(PROPERTY_ID, AGENCY_ID, { title: "New Title" });
    expect(result).toEqual(updated);
  });
});

describe("PropertiesService.delete", () => {
  function mockSession() {
    return {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      abortTransaction: jest.fn().mockResolvedValue(undefined),
      endSession: jest.fn(),
    };
  }

  function mockQuery(result: unknown) {
    const query = {
      session: jest.fn().mockReturnValue(result),
    };
    return query;
  }

  it("deletes the property and its reviews within a transaction", async () => {
    const session = mockSession();
    MockedPropertyModel.startSession.mockResolvedValue(session as never);
    const deleteQuery = mockQuery(Promise.resolve({ deletedCount: 1 }));
    MockedPropertyModel.deleteOne.mockReturnValue(deleteQuery as never);
    const reviewQuery = mockQuery(Promise.resolve({ deletedCount: 2 }));
    MockedReviewModel.deleteMany.mockReturnValue(reviewQuery as never);

    const result = await PropertiesService.delete(PROPERTY_ID, AGENCY_ID);

    expect(result).toBe(true);
    expect(MockedPropertyModel.startSession).toHaveBeenCalled();
    expect(session.startTransaction).toHaveBeenCalled();
    expect(MockedPropertyModel.deleteOne).toHaveBeenCalledWith({ _id: PROPERTY_ID, agencyId: AGENCY_ID });
    expect(deleteQuery.session).toHaveBeenCalledWith(session);
    expect(MockedReviewModel.deleteMany).toHaveBeenCalledWith({
      propertyId: PROPERTY_ID,
      agencyId: AGENCY_ID,
    });
    expect(reviewQuery.session).toHaveBeenCalledWith(session);
    expect(session.commitTransaction).toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });

  it("aborts and returns false when nothing was deleted", async () => {
    const session = mockSession();
    MockedPropertyModel.startSession.mockResolvedValue(session as never);
    const deleteQuery = mockQuery(Promise.resolve({ deletedCount: 0 }));
    MockedPropertyModel.deleteOne.mockReturnValue(deleteQuery as never);

    const result = await PropertiesService.delete(PROPERTY_ID, AGENCY_ID);

    expect(result).toBe(false);
    expect(session.abortTransaction).toHaveBeenCalled();
    expect(MockedReviewModel.deleteMany).not.toHaveBeenCalled();
    expect(session.commitTransaction).not.toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });

  it("aborts the transaction and throws InternalError on failure", async () => {
    const session = mockSession();
    MockedPropertyModel.startSession.mockResolvedValue(session as never);
    const deleteQuery = mockQuery(Promise.reject(new Error("db failure")));
    MockedPropertyModel.deleteOne.mockReturnValue(deleteQuery as never);

    await expect(PropertiesService.delete(PROPERTY_ID, AGENCY_ID)).rejects.toThrow(
      InternalError("Failed to delete property and associated data"),
    );
    expect(session.abortTransaction).toHaveBeenCalled();
    expect(session.commitTransaction).not.toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });
});

describe("PropertiesService.getRelated", () => {
  it("delegates to the repository", async () => {
    const related = [makeProperty({ slug: "related-home" })];
    MockedRepository.findRelated.mockResolvedValue(related as never);

    const result = await PropertiesService.getRelated(PROPERTY_ID, AGENCY_ID);

    expect(MockedRepository.findRelated).toHaveBeenCalledWith(PROPERTY_ID, AGENCY_ID);
    expect(result).toEqual(related);
  });
});
