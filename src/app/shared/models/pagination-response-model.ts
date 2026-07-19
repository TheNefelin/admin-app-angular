export interface PaginationResponseModel<T> {
  page: number;
  limit: number;
  total: number;
  items: T[];
}
