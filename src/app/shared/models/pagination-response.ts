export interface PaginationResponse<T> {
  page: number;
  pages: number;
  items: number;
  limit: number;
  data: T[];
}
