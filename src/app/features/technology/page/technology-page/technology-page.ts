import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TechnologyService } from '@features/technology/services/technology-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { catchError, finalize, map, of } from 'rxjs';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { SaveTechnologyModel, TechnologyModel } from '@features/technology/models/technology-model';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { ModalActionComponent } from "@shared/components/modal-action-component/modal-action-component";
import { PaginationNavComponent } from "@shared/components/pagination-nav-component/pagination-nav-component";
import { PaginationFilterComponent } from "@shared/components/pagination-filter-component/pagination-filter-component";
import { TechnologyFormComponent } from "@features/technology/components/technology-form-component/technology-form-component";
import { MessageSuccessComponent } from "@shared/components/message-success-component/message-success-component";


@Component({
  selector: 'app-technology-page',
  imports: [
    DatePipe,
    NgOptimizedImage,
    LoadingComponent,
    ButtonComponent,
    ModalActionComponent,
    PaginationNavComponent,
    PaginationFilterComponent,
    TechnologyFormComponent,
    MessageSuccessComponent
  ],
  templateUrl: './technology-page.html',
})
export class TechnologyPage {
  protected readonly successMessage = signal<string | null>(null);
  protected readonly showDeleteModal = signal<boolean>(false);
  protected readonly showFormModal = signal<boolean>(false);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly isDeleting = signal<boolean>(false);
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  private readonly limit = signal<number>(5);
  private readonly search = signal<string>('');

  private readonly service = inject(TechnologyService);
  private readonly getAllPayload = computed<PaginationRequestModel>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search()
  }));
  protected readonly getByIdPayload = signal<number | null>(null);
  protected readonly deleteItemId = signal<number | null>(null);
  protected readonly computedList = computed<TechnologyModel[]>(() => this.getAllRX.value() ?? []);
  protected readonly computedItem = computed<TechnologyModel | null>(() => {
    if (this.getByIdRX.isLoading()) return null;
    return this.getByIdRX.value() ?? null;
  });

  protected readonly getAllRX = rxResource({
    params: () => this.getAllPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.service.getAllPagination(params).pipe(
        map(response => {
          this.totalPages.set(response.pages);
          return response.data;
        }),
        catchError(err => {
          console.error('[TechnologyService::TechnologyPage] getAllPagination:', err);
          return of([]);
        })
      );
    },
  });

  protected readonly getByIdRX = rxResource({
    params: () => this.getByIdPayload(),
    stream: ({ params: id }) => {
      if (!id) return of(null);

      return this.service.getById(id).pipe(
        catchError(err => {
          console.error('[TechnologyService::TechnologyPage] getById:', err);
          return of(null);
        })
      );
    },
  });

  protected onRefreshClick(): void {
    this.getAllRX.reload();
    this.successMessage.set(null);
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
    this.getByIdPayload.set(null);
    this.showFormModal.set(true);
  }

  protected onEdit(item: TechnologyModel): void {
    this.getByIdPayload.set(item.id_technology);
    this.showFormModal.set(true);
  }

  protected onSubmitForm(data: SaveTechnologyModel): void {
    this.isSaving.set(true);
    const id = this.getByIdPayload();

    const request$ = id
    ? this.service.update(id, data)
    : this.service.create(data);

    request$.pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: () => {
        this.successMessage.set('Guardado correctamente');
        this.showFormModal.set(false);
        this.getAllRX.reload();
      },
      error: (err) => {
        console.error('[TechnologyService::TechnologyPage] onSubmitForm:', err);
      }
    });
  }

  protected onDelete(item: TechnologyModel): void {
    this.deleteItemId.set(item.id_technology);
    this.showDeleteModal.set(true);
  }

  protected onDeleteModalConfirm(): void {
    this.isDeleting.set(true);

    const id = this.deleteItemId();
    if (!id) return;

    this.service.delete(id).pipe(
      finalize(() => this.isDeleting.set(false))
    ).subscribe({
      next: () => {
        this.successMessage.set('Eliminado correctamente');
        this.showDeleteModal.set(false);
        this.getAllRX.reload();
      },
      error: (err) => {
        console.error('[TechnologyService::TechnologyPage] onDelete:', err);
      }
    });
  }
}
