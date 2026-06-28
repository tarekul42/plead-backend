import { QueryBuilder } from "../../utils/query-builder";

function createMockModel(findResult: unknown[] = [], countResult = 0, firstResult: unknown = null) {
  const query: Record<string, jest.Mock> = {
    select: jest.fn(),
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
  };
  query.select.mockReturnValue(query);
  query.sort.mockReturnValue(query);
  query.skip.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  query.lean = jest.fn().mockReturnValue(query);
  query.exec = jest.fn().mockResolvedValue(findResult);

  const find = jest.fn().mockReturnValue(query);

  // first() uses findOne, which returns a distinct query whose exec
  // resolves to a single document (or null).
  const firstQuery: Record<string, jest.Mock> = {
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  };
  firstQuery.lean = jest.fn().mockReturnValue(firstQuery);
  firstQuery.exec = jest.fn().mockResolvedValue(firstResult);
  const findOne = jest.fn().mockReturnValue(firstQuery);

  const countDocuments = jest
    .fn()
    .mockReturnValue({ exec: jest.fn().mockResolvedValue(countResult) });

  return { find, findOne, countDocuments, query, firstQuery };
}

describe("QueryBuilder", () => {
  describe("where", () => {
    it("adds a field to the filter", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).where("status", "active").exec();
      expect(model.find).toHaveBeenCalledWith({ status: "active" });
    });

    it("ignores undefined values", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).where("status", undefined).exec();
      expect(model.find).toHaveBeenCalledWith({});
    });

    it("ignores null values", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).where("status", null).exec();
      expect(model.find).toHaveBeenCalledWith({});
    });

    it("ignores empty string values", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).where("status", "").exec();
      expect(model.find).toHaveBeenCalledWith({});
    });

    it("keeps falsy but meaningful values like 0 and false", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).where("count", 0).exec();
      expect(model.find).toHaveBeenCalledWith({ count: 0 });
    });
  });

  describe("whereRegex", () => {
    it("adds a regex filter", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereRegex("name", "john").exec();
      expect(model.find).toHaveBeenCalledWith({ name: { $regex: "john", $options: "i" } });
    });

    it("uses custom regex options", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereRegex("name", "john", "").exec();
      expect(model.find).toHaveBeenCalledWith({ name: { $regex: "john", $options: "" } });
    });

    it("ignores empty values", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereRegex("name", "").exec();
      expect(model.find).toHaveBeenCalledWith({});
    });
  });

  describe("wherePrefix", () => {
    it("anchors the regex with ^", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).wherePrefix("name", "john").exec();
      expect(model.find).toHaveBeenCalledWith({
        name: { $regex: "^john", $options: "i" },
      });
    });

    it("escapes regex special characters", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).wherePrefix("name", "a.b*c").exec();
      expect(model.find).toHaveBeenCalledWith({
        name: { $regex: "^a\\.b\\*c", $options: "i" },
      });
    });

    it("ignores empty values", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).wherePrefix("name", "").exec();
      expect(model.find).toHaveBeenCalledWith({});
    });
  });

  describe("whereRange", () => {
    it("adds a $gte filter for min only", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereRange("price", 100).exec();
      expect(model.find).toHaveBeenCalledWith({ price: { $gte: 100 } });
    });

    it("adds a $lte filter for max only", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereRange("price", undefined, 500).exec();
      expect(model.find).toHaveBeenCalledWith({ price: { $lte: 500 } });
    });

    it("adds both $gte and $lte when both are provided", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereRange("price", 100, 500).exec();
      expect(model.find).toHaveBeenCalledWith({ price: { $gte: 100, $lte: 500 } });
    });

    it("adds nothing when neither min nor max is provided", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereRange("price").exec();
      expect(model.find).toHaveBeenCalledWith({});
    });
  });

  describe("whereBoolean", () => {
    it("sets true when value is 'true'", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereBoolean("active", "true").exec();
      expect(model.find).toHaveBeenCalledWith({ active: true });
    });

    it("sets false when value is 'false'", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereBoolean("active", "false").exec();
      expect(model.find).toHaveBeenCalledWith({ active: false });
    });

    it("adds nothing for other values", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereBoolean("active", "yes").exec();
      expect(model.find).toHaveBeenCalledWith({});
    });

    it("adds nothing when value is undefined", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereBoolean("active").exec();
      expect(model.find).toHaveBeenCalledWith({});
    });
  });

  describe("whereTextSearch", () => {
    it("adds a $text search filter", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereTextSearch("luxury home").exec();
      expect(model.find).toHaveBeenCalledWith({ $text: { $search: "luxury home" } });
    });

    it("ignores empty queries", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereTextSearch("").exec();
      expect(model.find).toHaveBeenCalledWith({});
    });
  });

  describe("whereIn", () => {
    it("adds a $in filter for a non-empty array", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereIn("status", ["new", "open"]).exec();
      expect(model.find).toHaveBeenCalledWith({ status: { $in: ["new", "open"] } });
    });

    it("ignores an empty array", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereIn("status", []).exec();
      expect(model.find).toHaveBeenCalledWith({});
    });
  });

  describe("whereNe", () => {
    it("adds a $ne filter", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereNe("status", "archived").exec();
      expect(model.find).toHaveBeenCalledWith({ status: { $ne: "archived" } });
    });

    it("ignores undefined values", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereNe("status", undefined).exec();
      expect(model.find).toHaveBeenCalledWith({});
    });

    it("ignores null values", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).whereNe("status", null).exec();
      expect(model.find).toHaveBeenCalledWith({});
    });
  });

  describe("search", () => {
    it("builds an $or regex across multiple fields", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).search(["title", "description"], "beach").exec();
      expect(model.find).toHaveBeenCalledWith({
        $or: [
          { title: { $regex: "beach", $options: "i" } },
          { description: { $regex: "beach", $options: "i" } },
        ],
      });
    });

    it("ignores an empty query", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).search(["title"], "").exec();
      expect(model.find).toHaveBeenCalledWith({});
    });

    it("ignores an empty fields array", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).search([], "beach").exec();
      expect(model.find).toHaveBeenCalledWith({});
    });
  });

  describe("sortAsc / sortDesc / sortBy", () => {
    it("sortAsc sets ascending order", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).sortAsc("createdAt").exec();
      expect(model.query.sort).toHaveBeenCalledWith({ createdAt: 1 });
    });

    it("sortDesc sets descending order", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).sortDesc("createdAt").exec();
      expect(model.query.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it("sortBy maps a known key to a descending sort", async () => {
      const model = createMockModel([], 0);
      const sortMap = { newest: "createdAt" };
      await new QueryBuilder(model as never).sortBy(sortMap, "newest").exec();
      expect(model.query.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it("sortBy maps oldest to ascending", async () => {
      const model = createMockModel([], 0);
      const sortMap = { oldest: "createdAt" };
      await new QueryBuilder(model as never).sortBy(sortMap, "oldest").exec();
      expect(model.query.sort).toHaveBeenCalledWith({ createdAt: 1 });
    });

    it("sortBy maps price-asc to ascending", async () => {
      const model = createMockModel([], 0);
      const sortMap = { "price-asc": "price" };
      await new QueryBuilder(model as never).sortBy(sortMap, "price-asc").exec();
      expect(model.query.sort).toHaveBeenCalledWith({ price: 1 });
    });

    it("sortBy does nothing for an unknown key", async () => {
      const model = createMockModel([], 0);
      const sortMap = { newest: "createdAt" };
      await new QueryBuilder(model as never).sortBy(sortMap, "bogus").exec();
      expect(model.query.sort).not.toHaveBeenCalled();
    });

    it("sortBy defaults to 'newest' when no key is given", async () => {
      const model = createMockModel([], 0);
      const sortMap = { newest: "createdAt" };
      await new QueryBuilder(model as never).sortBy(sortMap).exec();
      expect(model.query.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  describe("paginate", () => {
    it("sets skip and limit on the query", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).paginate(3, 10).exec();
      expect(model.query.skip).toHaveBeenCalledWith(20);
      expect(model.query.limit).toHaveBeenCalledWith(10);
    });

    it("clamps limit to maxLimit", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).paginate(1, 500, 50, 20).exec();
      expect(model.query.limit).toHaveBeenCalledWith(50);
    });

    it("clamps page to a minimum of 1", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).paginate(0, 10).exec();
      // page 0 clamps to 1, so skip = 0 and skip() is not called.
      expect(model.query.skip).not.toHaveBeenCalled();
      expect(model.query.limit).toHaveBeenCalledWith(10);
    });

    it("falls back to default limit when limit is 0 (falsy)", async () => {
      // Math.floor(0 || 20) === 20, so a limit of 0 uses the default.
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).paginate(1, 0).exec();
      expect(model.query.limit).toHaveBeenCalledWith(20);
    });

    it("uses defaults when page and limit are undefined", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).paginate().exec();
      // Defaults: page 1, limit 20, skip 0 — skip() is not called.
      expect(model.query.skip).not.toHaveBeenCalled();
      expect(model.query.limit).toHaveBeenCalledWith(20);
    });
  });

  describe("select", () => {
    it("applies a projection to the query", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).select({ name: 1, email: 1 }).exec();
      expect(model.query.select).toHaveBeenCalledWith({ name: 1, email: 1 });
    });
  });

  describe("exec", () => {
    it("returns data and total", async () => {
      const data = [{ id: 1 }, { id: 2 }];
      const model = createMockModel(data, 50);

      const result = await new QueryBuilder(model as never).exec();

      expect(result).toEqual({ data, total: 50 });
    });

    it("applies select, sort, skip, and limit in order", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never)
        .select({ name: 1 })
        .sortAsc("name")
        .paginate(2, 10)
        .exec();

      expect(model.query.select).toHaveBeenCalledWith({ name: 1 });
      expect(model.query.sort).toHaveBeenCalledWith({ name: 1 });
      expect(model.query.skip).toHaveBeenCalledWith(10);
      expect(model.query.limit).toHaveBeenCalledWith(10);
    });

    it("does not call skip or limit when pagination was not applied", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).exec();
      expect(model.query.skip).not.toHaveBeenCalled();
      expect(model.query.limit).not.toHaveBeenCalled();
    });

    it("does not call sort when no sort was applied", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).exec();
      expect(model.query.sort).not.toHaveBeenCalled();
    });

    it("does not call select when no projection was applied", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never).exec();
      expect(model.query.select).not.toHaveBeenCalled();
    });

    it("chains multiple where clauses into a single filter", async () => {
      const model = createMockModel([], 0);
      await new QueryBuilder(model as never)
        .where("status", "active")
        .where("type", "house")
        .exec();
      expect(model.find).toHaveBeenCalledWith({ status: "active", type: "house" });
    });
  });

  describe("first", () => {
    it("returns the first matching document", async () => {
      const doc = { id: 1, name: "First" };
      const model = createMockModel([], 0, doc);

      const result = await new QueryBuilder(model as never).where("status", "active").first();

      expect(model.findOne).toHaveBeenCalledWith({ status: "active" });
      expect(result).toEqual(doc);
    });

    it("returns null when nothing matches", async () => {
      const model = createMockModel([], 0, null);
      const result = await new QueryBuilder(model as never).first();
      expect(result).toBeNull();
    });

    it("applies select and sort to the query", async () => {
      const model = createMockModel([], 0, null);
      await new QueryBuilder(model as never).select({ name: 1 }).sortDesc("createdAt").first();
      expect(model.firstQuery.select).toHaveBeenCalledWith({ name: 1 });
      expect(model.firstQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  describe("count", () => {
    it("returns the count of matching documents", async () => {
      const model = createMockModel([], 7);
      const result = await new QueryBuilder(model as never).where("status", "active").count();
      expect(model.countDocuments).toHaveBeenCalledWith({ status: "active" });
      expect(result).toBe(7);
    });
  });
});
