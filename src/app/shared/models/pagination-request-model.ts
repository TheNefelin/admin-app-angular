export interface PaginationRequestModel<T = undefined> {
  page: number;
  limit: number;
  search?: string;
  filter?: T
}
