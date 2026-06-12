import { DatePipe, JsonPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { UrlGrpService } from '@features/url-grp/services/url-grp-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { catchError, map, of } from 'rxjs';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { CreateUrlGrpModel, UpdateUrlGrpModel, UrlGrpModel } from '@features/url-grp/models/url-grp-model';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { ModalActionComponent } from "@shared/components/modal-action-component/modal-action-component";
import { PaginationNavComponent } from "@shared/components/pagination-nav-component/pagination-nav-component";
import { PaginationFilterComponent } from "@shared/components/pagination-filter-component/pagination-filter-component";
import { UrlGrpFormComponent } from "@features/url-grp/components/url-grp-form-component/url-grp-form-component";


@Component({
  selector: 'app-url-grp-page',
  imports: [
    DatePipe,
    LoadingComponent,
    ButtonComponent,
    ModalActionComponent,
    PaginationNavComponent,
    PaginationFilterComponent,
    UrlGrpFormComponent
],
  templateUrl: './url-grp-page.html',
})
export class UrlGrpPage {
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showDeleteModal = signal<boolean>(false);
  protected readonly showFormModal = signal<boolean>(false);
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  private readonly limit = signal<number>(5);
  private readonly search = signal<string>('');

  private readonly serviceUrlGrp = inject(UrlGrpService);
  private readonly getAllUrlGrpPayload = computed<PaginationRequestModel>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search()
  }));
  protected readonly getByIdUrlGrpPayload = signal<number | null>(null);
  protected readonly computedUrlGrpList = computed<UrlGrpModel[]>(() => this.geAlltUrlGrpRX.value() ?? []);
  protected readonly computedUrlGrp = computed<UrlGrpModel | null>(() => {
    if (this.getByIdUrlGrpRX.isLoading()) return null;
    return this.getByIdUrlGrpRX.value() ?? null;
  });

  protected readonly geAlltUrlGrpRX = rxResource({
    params: () => this.getAllUrlGrpPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.serviceUrlGrp.getAllPagination(params).pipe(
        map(response => {
          this.totalPages.set(response.pages);
          return response.data;
        }),
        catchError(err => {
          this.errorMessage.set(`[UrlGrpService] Error fetching: ${err}`);
          console.error('[UrlGrpService] Error fetching:', err);
          return of([]);
        })
      );
    },
  });

  protected readonly getByIdUrlGrpRX = rxResource({
    params: () => this.getByIdUrlGrpPayload(),
    stream: ({ params: id }) => {
      if (!id) return of(null);

      return this.serviceUrlGrp.getById(id).pipe(
        catchError(err => {
          this.errorMessage.set(`[UrlGrpService] Error fetching: ${err}`);
          console.error('[UrlGrpService] Error fetching:', err);
          return of(null);
        })
      );
    },
  });

  protected onRefreshClick(): void {
    this.geAlltUrlGrpRX.reload();
  }

  protected onFilterChange(filter: { search: string; limit: number }): void {
    this.search.set(filter.search);
    this.limit.set(filter.limit);
    this.currentPage.set(1);
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages()){
      this.currentPage.update(e => e + 1);
    }
  }

  protected prevPage(): void {
    if (this.currentPage() > 1){
      this.currentPage.update(e => e - 1);
    }
  }

  protected onCreate(): void {
    this.getByIdUrlGrpPayload.set(null);
    this.showFormModal.set(true);
  }
  
  protected onEdit(item: UrlGrpModel): void {
    this.getByIdUrlGrpPayload.set(item.id_urlgrp);
    this.showFormModal.set(true);
  }

  protected onSubmitForm(data: UpdateUrlGrpModel | CreateUrlGrpModel): void {

  }

  protected onDelete(tem: UrlGrpModel): void {
    this.showDeleteModal.set(true);
  }

  protected onDeleteModalConfirm(): void {
    this.showDeleteModal.set(false);
  }
}
