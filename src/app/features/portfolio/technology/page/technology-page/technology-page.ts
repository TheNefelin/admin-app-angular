import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { SaveTechnologyModel, TechnologyModel } from '@features/portfolio/technology/models/technology-model';
import { TechnologyService } from '@features/portfolio/technology/services/technology-service';
import { CrudPage } from '@shared/base/crud-page';
import { PaginationFilterComponent } from '@shared/components/pagination-filter-component/pagination-filter-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { PaginationNavComponent } from '@shared/components/pagination-nav-component/pagination-nav-component';
import { TechnologyFormComponent } from '@features/portfolio/technology/components/technology-form-component/technology-form-component';
import { ConfirmService } from '@core/services/confirm-service';
import { MutationService } from '@core/services/mutation-service';

@Component({
  selector: 'app-technology-page',
  imports: [
    DatePipe,
    NgOptimizedImage,
    PaginationFilterComponent,
    ButtonComponent,
    LoadingComponent,
    PaginationNavComponent,
    TechnologyFormComponent,
  ],
  templateUrl: './technology-page.html',
})
export class TechnologyPage extends CrudPage<TechnologyModel> {
  private readonly confirmService = inject(ConfirmService);
  private readonly mutation = inject(MutationService);
  protected readonly showFormModal = signal<boolean>(false);
  protected readonly technology = {
    savePayload: signal<TechnologyModel | null>(null),
    isSaving: signal<boolean>(false),
  };

  private readonly service = inject(TechnologyService);
  protected readonly computedList = computed<TechnologyModel[]>(() => this.getAllRX.value() ?? []);

  protected readonly getAllRX = rxResource({
    params: () => this.getAllPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.service.getAllPagination(params).pipe(
        map(response => this.mapPaginated(response)),
        catchError(err => {
          console.error('[TechnologyService::TechnologyPage] getAllPagination:', err);
          return of(this.emptyPaginated());
        })
      );
    },
  });

  // EVENTS -----------------------------------------------------------------
  protected override reload(): void {
    this.getAllRX.reload();
  }

  protected onCreate(): void {
    this.technology.savePayload.set(null);
    this.showFormModal.set(true);
  }

  protected onEdit(item: TechnologyModel): void {
    this.technology.savePayload.set(item);
    this.showFormModal.set(true);
  }

  protected onCloseForm(): void {
    this.showFormModal.set(false);
    this.technology.savePayload.set(null);
  }

  protected onDeleteImage(): void {
    const id = this.technology.savePayload()?.id_technology;
    if (!id) return;

    this.mutation.run(
      this.service.deleteImage(id),
      this.technology,
      {
        successMsg: 'Imagen eliminada correctamente',
        errorMsg: 'Error al eliminar la imagen',
        onSuccess: () => {
          this.technology.savePayload.update(item => item ? { ...item, img_url: null } : item);
          this.getAllRX.reload();
        },
      }
    );
  }

  protected onSubmitForm({ data, file }: { data: SaveTechnologyModel; file: File | null }): void {
    const id = this.technology.savePayload()?.id_technology;

    const request$ = id
      ? this.service.update(id, data)
      : this.service.create(data);

    const action$ = request$.pipe(
      switchMap(result => {
        const entityId = result?.id_technology ?? id;

        if (entityId && file) {
          return this.service.uploadImage(entityId, { file });
        }

        return of(result);
      })
    );

    this.mutation.run(
      action$,
      this.technology,
      {
        successMsg: id ? 'Technology modificado correctamente' : 'Technology creado correctamente',
        errorMsg: id ? 'Error al modificar el Technology' : 'Error al crear el Technology',
        onSuccess: () => this.getAllRX.reload(),
        onClose: () => {
          this.showFormModal.set(false);
          this.technology.savePayload.set(null);
        },
      }
    );
  }

  protected async onDelete(item: TechnologyModel): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Technology',
      message: `Estás seguro que deseas eliminar (${item.name})`,
    });
    if (!confirmed) return;

    this.mutation.run(
      this.service.delete(item.id_technology),
      this.technology,
      {
        successMsg: 'Technology eliminado correctamente',
        errorMsg: 'Error al eliminar el Technology',
        onSuccess: () => this.getAllRX.reload(),
      }
    );
  }
}