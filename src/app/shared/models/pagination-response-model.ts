export interface PaginationResponseModel<T> {
  page: number;
  pages: number;
  items: number;
  limit: number;
  data: T[];
}
