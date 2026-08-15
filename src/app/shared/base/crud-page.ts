import { computed, signal } from '@angular/core';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';

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

  protected mapPaginated(response: PaginationResponseModel<TModel>): TModel[] {
    this.totalPages.set(Math.ceil(response.total / this.limit()));
    return response.items;
  }

  protected emptyPaginated(): TModel[] {
    this.totalPages.set(1);
    return [];
  }

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