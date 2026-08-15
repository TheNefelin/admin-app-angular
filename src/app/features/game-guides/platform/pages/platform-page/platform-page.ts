import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { PlatformModel, SavePlatformModel } from '@features/game-guides/platform/models/platform-model';
import { PlatformService } from '@features/game-guides/platform/services/platform-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationFilterComponent } from '@shared/components/pagination-filter-component/pagination-filter-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { PaginationNavComponent } from '@shared/components/pagination-nav-component/pagination-nav-component';
import { PlatformFormComponent } from '@features/game-guides/platform/components/platform-form-component/platform-form-component';
import { ConfirmService } from '@core/services/confirm-service';
import { MutationService } from '@core/services/mutation-service';

@Component({
  selector: 'app-platform-page',
  imports: [
    PaginationFilterComponent,
    ButtonComponent,
    LoadingComponent,
    PaginationNavComponent,
    PlatformFormComponent,
  ],
  templateUrl: './platform-page.html',
})
export class PlatformPage {
  private readonly confirmService = inject(ConfirmService);
  private readonly mutation = inject(MutationService);
  protected readonly showFormModal = signal<boolean>(false);
  protected readonly platform = {
    savePayload: signal<PlatformModel | null>(null),
    isSaving: signal<boolean>(false),
  };
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  private readonly limit = signal<number>(10);
  private readonly search = signal<string>('');

  private readonly service = inject(PlatformService);
  private readonly getAllPayload = computed<PaginationRequestModel>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search()
  }));
  protected readonly computedList = computed<PlatformModel[]>(() => this.getAllRX.value() ?? []);

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
          console.error('[PlatformService::PlatformPage] getAllPagination:', err);
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
    this.platform.savePayload.set(null);
    this.showFormModal.set(true);
  }

  protected onEdit(item: PlatformModel): void {
    this.platform.savePayload.set(item);
    this.showFormModal.set(true);
  }

  protected onCloseForm(): void {
    this.showFormModal.set(false);
    this.platform.savePayload.set(null);
  }

  protected onSubmitForm(data: SavePlatformModel): void {
    const id = this.platform.savePayload()?.id;

    this.mutation.run(
      id ? this.service.update(id, data) : this.service.create(data),
      this.platform,
      {
        successMsg: id ? 'Plataforma modificada correctamente' : 'Plataforma creada correctamente',
        errorMsg: id ? 'Error al modificar la Plataforma' : 'Error al crear la Plataforma',
        onSuccess: () => this.getAllRX.reload(),
        onFinalize: () => {
          this.showFormModal.set(false);
          this.platform.savePayload.set(null);
        },
      }
    );
  }

  protected async onDelete(item: PlatformModel): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Plataforma',
      message: `Estás seguro que deseas eliminar (${item.name})`,
    });
    if (!confirmed) return;

    this.mutation.run(
      this.service.delete(item.id),
      this.platform,
      {
        successMsg: 'Plataforma eliminada correctamente',
        errorMsg: 'Error al eliminar la Plataforma',
        onSuccess: () => this.getAllRX.reload(),
      }
    );
  }
}