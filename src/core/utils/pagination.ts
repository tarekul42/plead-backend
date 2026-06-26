import type { PaginationMeta, PaginateParams } from "../types/common.types";

export class Pagination {
  static from(query: Record<string, unknown>, defaultLimit = 20, maxLimit = 100): PaginateParams {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(maxLimit, Math.max(1, Number(query.limit) || defaultLimit));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  static meta(page: number, limit: number, total: number): PaginationMeta {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}