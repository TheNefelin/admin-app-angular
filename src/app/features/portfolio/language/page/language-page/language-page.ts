import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { SaveLanguageModel, LanguageModel } from '@features/portfolio/language/models/language-model';
import { LanguageService } from '@features/portfolio/language/services/language-service';
import { CrudPage } from '@shared/base/crud-page';
import { PaginationFilterComponent } from '@shared/components/pagination-filter-component/pagination-filter-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { PaginationNavComponent } from '@shared/components/pagination-nav-component/pagination-nav-component';
import { LanguageFormComponent } from '@features/portfolio/language/components/language-form-component/language-form-component';
import { ConfirmService } from '@core/services/confirm-service';
import { MutationService } from '@core/services/mutation-service';

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
export class LanguagePage extends CrudPage<LanguageModel> {
  private readonly confirmService = inject(ConfirmService);
  private readonly mutation = inject(MutationService);
  protected readonly showFormModal = signal<boolean>(false);
  protected readonly language = {
    savePayload: signal<LanguageModel | null>(null),
    isSaving: signal<boolean>(false),
  };

  private readonly service = inject(LanguageService);
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

  // EVENTS -----------------------------------------------------------------
  protected override reload(): void {
    this.getAllRX.reload();
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

    this.mutation.run(
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

    this.mutation.run(
      action$,
      this.language,
      {
        successMsg: id ? 'Language modificado correctamente' : 'Language creado correctamente',
        errorMsg: id ? 'Error al modificar el Language' : 'Error al crear el Language',
        onSuccess: () => this.getAllRX.reload(),
        onClose: () => {
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

    this.mutation.run(
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