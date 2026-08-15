import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { SaveTechnologyModel, TechnologyModel } from '@features/portfolio/technology/models/technology-model';
import { TechnologyService } from '@features/portfolio/technology/services/technology-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
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
export class TechnologyPage {
  private readonly confirmService = inject(ConfirmService);
  private readonly mutation = inject(MutationService);
  protected readonly showFormModal = signal<boolean>(false);
  protected readonly technology = {
    savePayload: signal<TechnologyModel | null>(null),
    isSaving: signal<boolean>(false),
  };
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  private readonly limit = signal<number>(10);
  private readonly search = signal<string>('');

  private readonly service = inject(TechnologyService);
  private readonly getAllPayload = computed<PaginationRequestModel>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search()
  }));
  protected readonly computedList = computed<TechnologyModel[]>(() => this.getAllRX.value() ?? []);

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
          console.error('[TechnologyService::TechnologyPage] getAllPagination:', err);
          return of([]);
        })
      );
    },
  });

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
        onFinalize: () => {
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