import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { PlatformModel, SavePlatformModel } from '@features/game-guides/platform/models/platform-model';
import { PlatformService } from '@features/game-guides/platform/services/platform-service';
import { CrudPage } from '@shared/base/crud-page';
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
export class PlatformPage extends CrudPage<PlatformModel> {
  private readonly confirmService = inject(ConfirmService);
  private readonly mutation = inject(MutationService);
  protected readonly showFormModal = signal<boolean>(false);
  protected readonly platform = {
    savePayload: signal<PlatformModel | null>(null),
    isSaving: signal<boolean>(false),
  };

  private readonly service = inject(PlatformService);
  protected readonly computedList = computed<PlatformModel[]>(() => this.getAllRX.value() ?? []);

  protected readonly getAllRX = rxResource({
    params: () => this.getAllPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.service.getAllPagination(params).pipe(
        map(response => this.mapPaginated(response)),
        catchError(err => {
          console.error('[PlatformService::PlatformPage] getAllPagination:', err);
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
        onClose: () => {
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