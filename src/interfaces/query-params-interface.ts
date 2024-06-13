export interface Pagination {
  page?: number;
  limit?: number;
}

export interface QueryParams extends Pagination {
  search?: string;
}
