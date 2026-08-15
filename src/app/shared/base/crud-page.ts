import { computed, signal } from '@angular/core';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';

export abstract class CrudPage<TModel> {
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  protected readonly limit = signal<number>(10);
  protected readonly search = signal<string>('');

  protected readonly getAllPayload = computed<PaginationRequestModel>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search()
  }));

  protected onRefreshClick(): void {
    this.reload();
  }

  protected abstract reload(): void;

  protected onFilterChange(filter: { search: string; limit: number }): void {
    this.search.set(filter.search);
    this.limit.set(filter.limit);
    this.currentPage.set(1);
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(e => e + 1);
    }
  }

  protected prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(e => e - 1);
    }
  }
}