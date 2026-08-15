import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal, type WritableSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, finalize, map, of, switchMap, type Observable } from 'rxjs';
import { SaveLanguageModel, LanguageModel } from '@features/portfolio/language/models/language-model';
import { LanguageService } from '@features/portfolio/language/services/language-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationFilterComponent } from '@shared/components/pagination-filter-component/pagination-filter-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { PaginationNavComponent } from '@shared/components/pagination-nav-component/pagination-nav-component';
import { LanguageFormComponent } from '@features/portfolio/language/components/language-form-component/language-form-component';
import { SuccessService } from '@core/services/success-service';
import { ConfirmService } from '@core/services/confirm-service';

@Component({
  selector: 'app-language-page',
  imports: [
    DatePipe,
    NgOptimizedImage,
    PaginationFilterComponent,
    ButtonComponent,
    LoadingComponent,
    PaginationNavComponent,
    LanguageFormComponent,
  ],
  templateUrl: './language-page.html',
})
export class LanguagePage {
  private readonly successService = inject(SuccessService);
  private readonly confirmService = inject(ConfirmService);
  protected readonly showFormModal = signal<boolean>(false);
  protected readonly language = {
    savePayload: signal<LanguageModel | null>(null),
    isSaving: signal<boolean>(false),
  };
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  private readonly limit = signal<number>(10);
  private readonly search = signal<string>('');

  private readonly service = inject(LanguageService);
  private readonly getAllPayload = computed<PaginationRequestModel>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search()
  }));
  protected readonly computedList = computed<LanguageModel[]>(() => this.getAllRX.value() ?? []);

  protected readonly getAllRX = rxResource({
    params: () => this.getAllPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.service.getAllPagination(params).pipe(
        map(response => {
          this.totalPages.set(Math.ceil(response.total / this.limit()));
          return response.items;
        }),
        catchError(err => {
          console.error('[LanguageService::LanguagePage] getAllPagination:', err);
          return of([]);
        })
      );
    },
  });

  // MUTATION HELPER --------------------------------------------------------
  private handleMutation<T>(
    action: Observable<T>,
    state: { isSaving: WritableSignal<boolean> },
    options: {
      successMsg: string;
      errorMsg: string;
      onSuccess?: () => void;
      onFinalize?: () => void;
    },
  ): void {
    state.isSaving.set(true);
    action.pipe(
      finalize(() => {
        state.isSaving.set(false);
        options.onFinalize?.();
      })
    ).subscribe({
      next: () => {
        this.successService.show(options.successMsg);
        options.onSuccess?.();
      },
      error: (err) => {
        console.error(`[LanguageService::LanguagePage] ${options.errorMsg}:`, err);
      }
    });
  }

  // EVENTS -----------------------------------------------------------------
  protected onRefreshClick(): void {
    this.getAllRX.reload();
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
    this.language.savePayload.set(null);
    this.showFormModal.set(true);
  }

  protected onEdit(item: LanguageModel): void {
    this.language.savePayload.set(item);
    this.showFormModal.set(true);
  }

  protected onCloseForm(): void {
    this.showFormModal.set(false);
    this.language.savePayload.set(null);
  }

  protected onDeleteImage(): void {
    const id = this.language.savePayload()?.id_language;
    if (!id) return;

    this.handleMutation(
      this.service.deleteImage(id),
      this.language,
      {
        successMsg: 'Imagen eliminada correctamente',
        errorMsg: 'Error al eliminar la imagen',
        onSuccess: () => {
          this.language.savePayload.update(item => item ? { ...item, img_url: null } : item);
          this.getAllRX.reload();
        },
      }
    );
  }

  protected onSubmitForm({ data, file }: { data: SaveLanguageModel; file: File | null }): void {
    const id = this.language.savePayload()?.id_language;

    const request$ = id
      ? this.service.update(id, data)
      : this.service.create(data);

    const action$ = request$.pipe(
      switchMap(result => {
        const entityId = result?.id_language ?? id;

        if (entityId && file) {
          return this.service.uploadImage(entityId, { file });
        }

        return of(result);
      })
    );

    this.handleMutation(
      action$,
      this.language,
      {
        successMsg: id ? 'Language modificado correctamente' : 'Language creado correctamente',
        errorMsg: id ? 'Error al modificar el Language' : 'Error al crear el Language',
        onSuccess: () => this.getAllRX.reload(),
        onFinalize: () => {
          this.showFormModal.set(false);
          this.language.savePayload.set(null);
        },
      }
    );
  }

  protected async onDelete(item: LanguageModel): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Language',
      message: `Estás seguro que deseas eliminar (${item.name})`,
    });
    if (!confirmed) return;

    this.handleMutation(
      this.service.delete(item.id_language),
      this.language,
      {
        successMsg: 'Language eliminado correctamente',
        errorMsg: 'Error al eliminar el Language',
        onSuccess: () => this.getAllRX.reload(),
      }
    );
  }
}