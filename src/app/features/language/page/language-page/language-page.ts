import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { LanguageService } from '@features/language/services/language-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { SaveLanguageModel, LanguageModel } from '@features/language/models/language-model';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { ModalActionComponent } from "@shared/components/modal-action-component/modal-action-component";
import { PaginationNavComponent } from "@shared/components/pagination-nav-component/pagination-nav-component";
import { PaginationFilterComponent } from "@shared/components/pagination-filter-component/pagination-filter-component";
import { LanguageFormComponent } from "@features/language/components/language-form-component/language-form-component";
import { MessageSuccessComponent } from "@shared/components/message-success-component/message-success-component";


@Component({
  selector: 'app-language-page',
  imports: [
    DatePipe,
    NgOptimizedImage,
    LoadingComponent,
    ButtonComponent,
    ModalActionComponent,
    PaginationNavComponent,
    PaginationFilterComponent,
    LanguageFormComponent,
    MessageSuccessComponent
  ],
  templateUrl: './language-page.html',
})
export class LanguagePage {
  protected readonly successMessage = signal<string | null>(null);
  protected readonly deleteMessage = signal<string>('');
  protected readonly showDeleteModal = signal<boolean>(false);
  protected readonly showFormModal = signal<boolean>(false);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly isDeleting = signal<boolean>(false);
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  private readonly limit = signal<number>(5);
  private readonly search = signal<string>('');

  private readonly service = inject(LanguageService);
  private readonly getAllPayload = computed<PaginationRequestModel>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search()
  }));
  protected readonly getByIdPayload = signal<number | null>(null);
  protected readonly deleteItemId = signal<number | null>(null);
  protected readonly computedList = computed<LanguageModel[]>(() => this.getAllRX.value() ?? []);
  protected readonly computedItem = computed<LanguageModel | null>(() => {
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
          console.error('[LanguageService::LanguagePage] getAllPagination:', err);
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
          console.error('[LanguageService::LanguagePage] getById:', err);
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

  protected onEdit(item: LanguageModel): void {
    this.getByIdPayload.set(item.id_language);
    this.showFormModal.set(true);
  }

  protected onDeleteImage(): void {
    const id = this.getByIdPayload();
    if (!id) return;

    this.isSaving.set(true);

    this.service.deleteImage(id).pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: () => {
        this.getByIdRX.reload();
        this.getAllRX.reload();
      },
      error: (err) => console.error('[LanguageService::LanguagePage] onDeleteImage:', err)
    });
  }

  protected onSubmitForm({ data, file }: { data: SaveLanguageModel; file: File | null }): void {
    this.isSaving.set(true);
    const id = this.getByIdPayload();

    const request$ = id
    ? this.service.update(id, data)
    : this.service.create(data);

    request$.pipe(
      switchMap(result => {
        const entityId = result?.id_language ?? id;

        if (entityId && file) {
          return this.service.uploadImage(entityId, { file });
        }
        
        return of(null);
      }),
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: () => this.finalizeSave(),
      error: (err) => console.error('[LanguageService::LanguagePage] onSubmitForm:', err)
    });
  }

  private finalizeSave(): void {
    this.successMessage.set('Guardado correctamente');
    this.showFormModal.set(false);
    this.getByIdPayload.set(null);
    this.getAllRX.reload();
  }

  protected onCloseForm(): void {
    this.showFormModal.set(false);
    this.getByIdPayload.set(null);
  }

  protected onDelete(item: LanguageModel): void {
    this.deleteMessage.set(`Estas seguro que deceas eliminar (${item.name})`);
    this.deleteItemId.set(item.id_language);
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
        console.error('[LanguageService::LanguagePage] onDelete:', err);
      }
    });
  }
}
