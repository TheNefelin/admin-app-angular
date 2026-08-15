import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { GenreModel, SaveGenreModel } from '@features/game-guides/genre/models/genre-model';
import { GenreService } from '@features/game-guides/genre/services/genre-service';
import { CrudPage } from '@shared/base/crud-page';
import { PaginationFilterComponent } from '@shared/components/pagination-filter-component/pagination-filter-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { PaginationNavComponent } from '@shared/components/pagination-nav-component/pagination-nav-component';
import { GenreFormComponent } from '@features/game-guides/genre/components/genre-form-component/genre-form-component';
import { ConfirmService } from '@core/services/confirm-service';
import { MutationService } from '@core/services/mutation-service';

@Component({
  selector: 'app-genre-page',
  imports: [
    PaginationFilterComponent,
    ButtonComponent,
    LoadingComponent,
    PaginationNavComponent,
    GenreFormComponent,
  ],
  templateUrl: './genre-page.html',
})
export class GenrePage extends CrudPage<GenreModel> {
  private readonly confirmService = inject(ConfirmService);
  private readonly mutation = inject(MutationService);
  protected readonly showFormModal = signal<boolean>(false);
  protected readonly genre = {
    savePayload: signal<GenreModel | null>(null),
    isSaving: signal<boolean>(false),
  };

  private readonly service = inject(GenreService);
  protected readonly computedList = computed<GenreModel[]>(() => this.getAllRX.value() ?? []);

  protected readonly getAllRX = rxResource({
    params: () => this.getAllPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.service.getAllPagination(params).pipe(
        map(response => this.mapPaginated(response)),
        catchError(err => {
          console.error('[GenreService::GenrePage] getAllPagination:', err);
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
    this.genre.savePayload.set(null);
    this.showFormModal.set(true);
  }

  protected onEdit(item: GenreModel): void {
    this.genre.savePayload.set(item);
    this.showFormModal.set(true);
  }

  protected onCloseForm(): void {
    this.showFormModal.set(false);
    this.genre.savePayload.set(null);
  }

  protected onSubmitForm(data: SaveGenreModel): void {
    const id = this.genre.savePayload()?.id;

    this.mutation.run(
      id ? this.service.update(id, data) : this.service.create(data),
      this.genre,
      {
        successMsg: id ? 'Género modificado correctamente' : 'Género creado correctamente',
        errorMsg: id ? 'Error al modificar el Género' : 'Error al crear el Género',
        onSuccess: () => this.getAllRX.reload(),
        onClose: () => {
          this.showFormModal.set(false);
          this.genre.savePayload.set(null);
        },
      }
    );
  }

  protected async onDelete(item: GenreModel): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Género',
      message: `Estás seguro que deseas eliminar (${item.name})`,
    });
    if (!confirmed) return;

    this.mutation.run(
      this.service.delete(item.id),
      this.genre,
      {
        successMsg: 'Género eliminado correctamente',
        errorMsg: 'Error al eliminar el Género',
        onSuccess: () => this.getAllRX.reload(),
      }
    );
  }
}