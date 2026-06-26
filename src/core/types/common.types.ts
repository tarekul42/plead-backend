export type Role = "agent" | "manager" | "admin";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SuccessResponse<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta;
};

export type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface PaginateParams {
  page: number;
  limit: number;
  skip: number;
}
