import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { UrlService } from '@features/url/services/url-service';
import { catchError, finalize, map, of } from 'rxjs';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { CreateUrlModel, UpdateUrlModel, UrlModel } from '@features/url/models/url-model';
import { PaginationFilterComponent } from "@shared/components/pagination-filter-component/pagination-filter-component";
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { MessageSuccessComponent } from "@shared/components/message-success-component/message-success-component";
import { MessageErrorComponent } from "@shared/components/message-error-component/message-error-component";
import { PaginationNavComponent } from "@shared/components/pagination-nav-component/pagination-nav-component";
import { ModalActionComponent } from "@shared/components/modal-action-component/modal-action-component";

@Component({
  selector: 'app-url-page',
  imports: [
    DatePipe,
    LoadingComponent,
    PaginationFilterComponent,
    ButtonComponent,
    MessageSuccessComponent,
    MessageErrorComponent,
    PaginationNavComponent,
    ModalActionComponent,
  ],
  templateUrl: './url-page.html',
})
export class UrlPage {
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showDeleteModal = signal<boolean>(false);
  protected readonly showFormModal = signal<boolean>(false);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly isDeleting = signal<boolean>(false);
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  private readonly limit = signal<number>(10);
  private readonly search = signal<string>('');

  private readonly serviceUrl = inject(UrlService);
  private readonly getAllUrlPayload = computed<PaginationRequestModel>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search()
  }));
  protected readonly getByIdUrlPayload = signal<number | null>(null);
  protected readonly deleteItemId = signal<number | null>(null);
  protected readonly computedUrlList = computed<UrlModel[]>(() => this.getAllUrlRX.value() ?? []);
  protected readonly computedGrp = computed<UrlModel | null>(() => {
    if (this.getByIdUrlRX.isLoading()) return null;
    return this.getByIdUrlRX.value() ?? null;
  });

  protected readonly getAllUrlRX = rxResource({
    params: () => this.getAllUrlPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.serviceUrl.getAllPagination(params).pipe(
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

  protected readonly getByIdUrlRX = rxResource({
    params: () => this.getByIdUrlPayload(),
    stream: ({ params: id }) => {
      if (!id) return of(null);

      return this.serviceUrl.getById(id).pipe(
        catchError(err => {
          this.errorMessage.set(`[UrlGrpService] Error fetching: ${err}`);
          console.error('[UrlGrpService] Error fetching:', err);
          return of(null);
        })
      );
    },
  });

  protected onRefreshClick(): void {
    this.getAllUrlRX.reload();
    this.successMessage.set(null);
    this.errorMessage.set(null);
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
    this.getByIdUrlPayload.set(null);
    this.showFormModal.set(true);
  }
  
  protected onEdit(item: UrlModel): void {
    this.getByIdUrlPayload.set(item.id_urlgrp);
    this.showFormModal.set(true);
  }

  protected onSubmitForm(data: UpdateUrlModel | CreateUrlModel): void {
    this.isSaving.set(true);

    const request$ = 'id_url' in data
    ? this.serviceUrl.update(data.id_url, data)
    : this.serviceUrl.create(data);

    request$.pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: () => {
        this.successMessage.set('Guardado correctamente');
        this.showFormModal.set(false);
        this.getAllUrlRX.reload();
      },
      error: (err) => {
        this.errorMessage.set(`Error: ${err}`)
      }
    });
  }

  protected onDelete(item: UrlModel): void {
    this.deleteItemId.set(item.id_urlgrp);
    this.showDeleteModal.set(true);
  }

  protected onDeleteModalConfirm(): void {
    this.isDeleting.set(true);
    
    const id = this.deleteItemId();
    if (!id) return;

    this.serviceUrl.delete(id).pipe(
      finalize(() => this.isDeleting.set(false))
    ).subscribe({
      next: () => {
        this.successMessage.set('Eliminado correctamente');
        this.showDeleteModal.set(false);
        this.getAllUrlRX.reload();
      },
      error: (err) => {
        this.errorMessage.set(`Error al eliminar: ${err}`)
      }
    });
  }
}
