export interface Pagination {
  page?: string;
  limit?: string;
}

export interface QueryParams extends Pagination {
  search?: string;
}
