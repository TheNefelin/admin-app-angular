import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, finalize, map, of } from 'rxjs';
import { PlatformModel, SavePlatformModel } from '@features/game-guides/platform/models/platform-model';
import { PlatformService } from '@features/game-guides/platform/services/platform-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationFilterComponent } from "@shared/components/pagination-filter-component/pagination-filter-component";
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { MessageSuccessComponent } from "@shared/components/message-success-component/message-success-component";
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { PaginationNavComponent } from "@shared/components/pagination-nav-component/pagination-nav-component";
import { ModalActionComponent } from "@shared/components/modal-action-component/modal-action-component";
import { PlatformFormComponent } from '@features/game-guides/platform/components/platform-form-component/platform-form-component';

@Component({
  selector: 'app-platform-page',
  imports: [
    PaginationFilterComponent,
    ButtonComponent,
    MessageSuccessComponent,
    LoadingComponent,
    PaginationNavComponent,
    ModalActionComponent,
    PlatformFormComponent,
  ],
  templateUrl: './platform-page.html',
})
export class PlatformPage {
  protected readonly successMessage = signal<string | null>(null);
  protected readonly deleteMessage = signal<string>('');
  protected readonly showDeleteModal = signal<boolean>(false);
  protected readonly showFormModal = signal<boolean>(false);
  protected readonly isDeleting = signal<boolean>(false);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  private readonly limit = signal<number>(5);
  private readonly search = signal<string>('');
  protected readonly editItem = signal<PlatformModel | null>(null);

  private readonly service = inject(PlatformService);
  private readonly getAllPayload = computed<PaginationRequestModel>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search()
  }));
  protected readonly deleteItemId = signal<number | null>(null);
  protected readonly computedList = computed<PlatformModel[]>(() => this.getAllRX.value() ?? []);

  protected readonly getAllRX = rxResource({
    params: () => this.getAllPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.service.getAllPagination(params).pipe(
        map(response => {
          this.totalPages.set(response.total);
          return response.items;
        }),
        catchError(err => {
          console.error('[PlatformService::PlatformPage] getAllPagination:', err);
          return of([]);
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
    this.editItem.set(null);
    this.showFormModal.set(true);
  }

  protected onEdit(item: PlatformModel): void {
    this.editItem.set(item);
    this.showFormModal.set(true);
  }

  protected onCloseForm(): void {
    this.showFormModal.set(false);
  }

  protected onSubmitForm(data: SavePlatformModel): void {
    this.isSaving.set(true);
    this.successMessage.set(null);

    const id = this.editItem()?.id;
    const request$ = id
      ? this.service.update(id, data)
      : this.service.create(data);

    request$.pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: () => {
        this.successMessage.set(id ? 'Modificado correctamente' : 'Creado correctamente');
        this.showFormModal.set(false);
        this.getAllRX.reload();
      },
      error: (err) => {
        console.error('[PlatformService::PlatformPage] onSubmitForm:', err);
      }
    });
  }

  protected onDelete(item: PlatformModel): void {
    this.deleteMessage.set(`Estas seguro que deceas eliminar (${item.name})`);
    this.deleteItemId.set(item.id);
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
        console.error('[PlatformService::PlatformPage] onDelete:', err);
      }
    });
  }
}
