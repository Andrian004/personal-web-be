import { PaginationResponse } from "../types/pagination-response";

export interface DefaultResponse<
  TBody = Record<string, unknown> | Record<string, unknown>[]
> {
  message: string;
  body?: TBody;
  pagination?: PaginationResponse;
}
