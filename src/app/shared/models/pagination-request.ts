export interface PaginationRequest<T = undefined> {
  page: number;
  limit: number;
  search?: string;
  filter?: T
}
