import { QueryBuilder } from "../query-builder";

interface TestDoc {
  name: string;
  age: number;
  email: string;
}

const mockModel = {
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

describe("QueryBuilder", () => {
  let qb: QueryBuilder<TestDoc>;

  beforeEach(() => {
    jest.clearAllMocks();
    qb = new QueryBuilder<TestDoc>(mockModel as any);
  });

  describe("where", () => {
    it("adds exact match filter", () => {
      qb.where("name", "John");
      mockModel.exec.mockResolvedValueOnce([{ name: "John" }]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(1) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({ name: "John" });
      });
    });

    it("skips null/undefined/empty values", () => {
      qb.where("name", undefined).where("age", null).where("email", "");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({});
      });
    });
  });

  describe("wherePrefix", () => {
    it("adds prefix-anchored regex with escaped value", () => {
      qb.wherePrefix("name", "Joh");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({
          name: { $regex: "^Joh", $options: "i" },
        });
      });
    });

    it("escapes special regex characters", () => {
      qb.wherePrefix("name", "Jo.hn");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({
          name: { $regex: "^Jo\\.hn", $options: "i" },
        });
      });
    });

    it("skips empty prefix", () => {
      qb.wherePrefix("name", "");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({});
      });
    });
  });

  describe("whereRange", () => {
    it("adds $gte and $lte", () => {
      qb.whereRange("age", 18, 65);
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({ age: { $gte: 18, $lte: 65 } });
      });
    });

    it("adds only $gte", () => {
      qb.whereRange("age", 18);
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({ age: { $gte: 18 } });
      });
    });

    it("does nothing when both undefined", () => {
      qb.whereRange("age");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({});
      });
    });
  });

  describe("whereBoolean", () => {
    it("parses 'true' as boolean true", () => {
      qb.whereBoolean("isActive", "true");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({ isActive: true });
      });
    });

    it("parses 'false' as boolean false", () => {
      qb.whereBoolean("isActive", "false");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({ isActive: false });
      });
    });

    it("ignores undefined", () => {
      qb.whereBoolean("isActive");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({});
      });
    });
  });

  describe("whereIn", () => {
    it("adds $in filter", () => {
      qb.whereIn("age", [1, 2, 3]);
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({ age: { $in: [1, 2, 3] } });
      });
    });

    it("skips empty arrays", () => {
      qb.whereIn("age", []);
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({});
      });
    });
  });

  describe("whereNe", () => {
    it("adds $ne filter", () => {
      qb.whereNe("status", "deleted");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({ status: { $ne: "deleted" } });
      });
    });

    it("skips null/undefined", () => {
      qb.whereNe("status", null).whereNe("status", undefined);
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({});
      });
    });
  });

  describe("search", () => {
    it("adds $or with regex on multiple fields", () => {
      qb.search(["name", "email"], "john");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({
          $or: [
            { name: { $regex: "john", $options: "i" } },
            { email: { $regex: "john", $options: "i" } },
          ],
        });
      });
    });

    it("skips empty query", () => {
      qb.search(["name"], "");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({});
      });
    });
  });

  describe("sortAsc / sortDesc", () => {
    it("sorts ascending", () => {
      qb.sortAsc("age");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.sort).toHaveBeenCalledWith({ age: 1 });
      });
    });

    it("sorts descending", () => {
      qb.sortDesc("age");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.sort).toHaveBeenCalledWith({ age: -1 });
      });
    });
  });

  describe("paginate", () => {
    it("sets skip and limit", () => {
      qb.paginate(2, 10);
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.skip).toHaveBeenCalledWith(10);
        expect(mockModel.limit).toHaveBeenCalledWith(10);
      });
    });

    it("does not skip when page is 1", () => {
      qb.paginate(1, 20);
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.skip).not.toHaveBeenCalled();
        expect(mockModel.limit).toHaveBeenCalledWith(20);
      });
    });
  });

  describe("exec", () => {
    it("returns data and total from parallel queries", async () => {
      const data = [{ name: "John", age: 30, email: "john@test.com" }];
      mockModel.exec.mockResolvedValueOnce(data);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(1) } as any);

      const result = await qb.exec();
      expect(result).toEqual({ data, total: 1 });
    });
  });

  describe("first", () => {
    it("returns single document", async () => {
      const doc = { name: "John", age: 30, email: "john@test.com" };
      mockModel.exec.mockResolvedValueOnce(doc);
      const result = await qb.first();
      expect(result).toEqual(doc);
    });
  });

  describe("count", () => {
    it("returns count of matching documents", async () => {
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(5) } as any);
      const result = await qb.count();
      expect(result).toBe(5);
    });
  });

  describe("whereRegex", () => {
    it("adds regex filter for non-empty value", () => {
      qb.whereRegex("name", "John");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({
          name: { $regex: "John", $options: "i" },
        });
      });
    });

    it("skips empty value", () => {
      qb.whereRegex("name", "");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({});
      });
    });
  });

  describe("whereTextSearch", () => {
    it("adds $text search for non-empty query", () => {
      qb.whereTextSearch("luxury apartment");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({
          $text: { $search: "luxury apartment" },
        });
      });
    });

    it("skips empty query", () => {
      qb.whereTextSearch();
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.find).toHaveBeenCalledWith({});
      });
    });
  });

  describe("sortAsc with undefined field", () => {
    it("handles undefined field gracefully", () => {
      qb.sortAsc(undefined as any);
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.sort).toHaveBeenCalledWith({ undefined: 1 });
      });
    });
  });

  describe("sortDesc with undefined field", () => {
    it("handles undefined field gracefully", () => {
      qb.sortDesc(undefined as any);
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.sort).toHaveBeenCalledWith({ undefined: -1 });
      });
    });
  });

  describe("sortBy", () => {
    it("selects field from sort map using sortKey", () => {
      const sortMap = { newest: "createdAt", oldest: "createdAt", "price-asc": "price", "price-desc": "price" };
      qb.sortBy(sortMap, "oldest");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.sort).toHaveBeenCalledWith({ createdAt: 1 });
      });
    });

    it("defaults to newest sortKey", () => {
      const sortMap = { newest: "createdAt" };
      qb.sortBy(sortMap);
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.sort).toHaveBeenCalledWith({ createdAt: -1 });
      });
    });

    it("handles unknown sort key by not sorting", () => {
      const sortMap = { newest: "createdAt" };
      qb.sortBy(sortMap, "unknown_key");
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.sort).not.toHaveBeenCalled();
      });
    });
  });

  describe("select", () => {
    it("sets projection fields and passes them to query", () => {
      qb.select({ name: 1, age: 1 });
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      return qb.exec().then(() => {
        expect(mockModel.select).toHaveBeenCalledWith({ name: 1, age: 1 });
      });
    });
  });

  describe("exec with empty result", () => {
    it("returns { data: [], total: 0 } when no data", async () => {
      mockModel.exec.mockResolvedValueOnce([]);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      const result = await qb.exec();
      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe("first returns null", () => {
    it("returns null when no document matches", async () => {
      mockModel.exec.mockResolvedValueOnce(null);
      const result = await qb.first();
      expect(result).toBeNull();
    });
  });

  describe("count returns zero", () => {
    it("returns 0 when no documents match", async () => {
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValueOnce(0) } as any);
      const result = await qb.count();
      expect(result).toBe(0);
    });
  });

  describe("paginate with undefined params", () => {
    it("uses defaults when page and limit are undefined", () => {
      qb.paginate(undefined as any, undefined as any);
      expect((qb as any).skipValue).toBe(0);
      expect((qb as any).limitValue).toBe(20);
    });

    it("uses defaults when page and limit are not provided", () => {
      qb.paginate();
      expect((qb as any).skipValue).toBe(0);
      expect((qb as any).limitValue).toBe(20);
    });
  });

  describe("chaining", () => {
    it("supports method chaining", () => {
      const qb2 = new QueryBuilder<TestDoc>(mockModel as any);
      expect(qb2.where("name", "John").sortAsc("age").paginate(1, 20)).toBe(qb2);
    });
  });
});
