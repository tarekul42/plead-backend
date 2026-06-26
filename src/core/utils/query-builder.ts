import { Model } from "mongoose";

export class QueryBuilder<T> {
  private filter: Record<string, unknown> = {};
  private sort: Record<string, 1 | -1> = {};
  private skipValue = 0;
  private limitValue = 0;
  private projectionFields: Record<string, 1 | 0> | null = null;

  constructor(private model: Model<T>) {}

  where(field: string, value: unknown): this {
    if (value !== undefined && value !== null && value !== "") this.filter[field] = value;
    return this;
  }

  whereRegex(field: string, value: string, options = "i"): this {
    if (value) this.filter[field] = { $regex: value, $options: options };
    return this;
  }

  whereRange(field: string, min?: number, max?: number): this {
    if (min !== undefined || max !== undefined) {
      const range: Record<string, number> = {};
      if (min !== undefined) range.$gte = min;
      if (max !== undefined) range.$lte = max;
      this.filter[field] = range;
    }
    return this;
  }

  whereBoolean(field: string, value?: string): this {
    if (value === "true") this.filter[field] = true;
    else if (value === "false") this.filter[field] = false;
    return this;
  }

  whereTextSearch(query?: string): this {
    if (query) this.filter.$text = { $search: query };
    return this;
  }

  whereIn(field: string, values: unknown[]): this {
    if (values && values.length > 0) this.filter[field] = { $in: values };
    return this;
  }

  whereNe(field: string, value: unknown): this {
    if (value !== undefined && value !== null) this.filter[field] = { $ne: value };
    return this;
  }

  search(fields: string[], query?: string, options = "i"): this {
    if (query && fields.length > 0) {
      this.filter.$or = fields.map(f => ({
        [f]: { $regex: query, $options: options },
      }));
    }
    return this;
  }

  sortAsc(field: string): this {
    this.sort[field] = 1;
    return this;
  }

  sortDesc(field: string): this {
    this.sort[field] = -1;
    return this;
  }

  sortBy(sortMap: Record<string, string>, sortKey?: string): this {
    const key = sortKey || "newest";
    const field = sortMap[key];
    if (field) {
      this.sort[field] = key === "oldest" || key === "price-asc" ? 1 : -1;
    }
    return this;
  }

  paginate(page?: number, limit?: number, maxLimit = 100, defaultLimit = 20): this {
    const p = Math.max(1, page || 1);
    const l = Math.min(maxLimit, Math.max(1, limit || defaultLimit));
    this.skipValue = (p - 1) * l;
    this.limitValue = l;
    return this;
  }

  select(fields: Record<string, 1 | 0>): this {
    this.projectionFields = fields;
    return this;
  }

  async exec(): Promise<{ data: T[]; total: number }> {
    let query = this.model.find(this.filter);

    if (this.projectionFields) query = query.select(this.projectionFields);
    if (Object.keys(this.sort).length > 0) query = query.sort(this.sort);
    if (this.skipValue > 0) query = query.skip(this.skipValue);
    if (this.limitValue > 0) query = query.limit(this.limitValue);

    const [data, total] = await Promise.all([
      query.lean().exec() as Promise<T[]>,
      this.model.countDocuments(this.filter).exec(),
    ]);

    return { data, total };
  }

  async first(): Promise<T | null> {
    let query = this.model.findOne(this.filter);
    if (this.projectionFields) query = query.select(this.projectionFields);
    if (Object.keys(this.sort).length > 0) query = query.sort(this.sort);
    return query.lean().exec() as Promise<T | null>;
  }

  async count(): Promise<number> {
    return this.model.countDocuments(this.filter).exec();
  }
}