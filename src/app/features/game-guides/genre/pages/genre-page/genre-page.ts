import { Component, computed, inject, signal, type WritableSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, finalize, map, of, type Observable } from 'rxjs';
import { GenreModel, SaveGenreModel } from '@features/game-guides/genre/models/genre-model';
import { GenreService } from '@features/game-guides/genre/services/genre-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationFilterComponent } from '@shared/components/pagination-filter-component/pagination-filter-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { PaginationNavComponent } from '@shared/components/pagination-nav-component/pagination-nav-component';
import { GenreFormComponent } from '@features/game-guides/genre/components/genre-form-component/genre-form-component';
import { SuccessService } from '@core/services/success-service';
import { ConfirmService } from '@core/services/confirm-service';
import { ErrorService } from '@core/services/error-service';

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
export class GenrePage {
  private readonly errorService = inject(ErrorService);
  private readonly successService = inject(SuccessService);
  private readonly confirmService = inject(ConfirmService);
  protected readonly showFormModal = signal<boolean>(false);
  protected readonly genre = {
    savePayload: signal<GenreModel | null>(null),
    isSaving: signal<boolean>(false),
  };
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  private readonly limit = signal<number>(5);
  private readonly search = signal<string>('');

  private readonly service = inject(GenreService);
  private readonly getAllPayload = computed<PaginationRequestModel>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search()
  }));
  protected readonly computedList = computed<GenreModel[]>(() => this.getAllRX.value() ?? []);

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
          console.error('[GenreService::GenrePage] getAllPagination:', err);
          this.errorService.show(err?.error?.detail || err?.message || 'Error al cargar los géneros');
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
        console.error(`[GenreService::GenrePage] ${options.errorMsg}:`, err);
        this.errorService.show(err?.error?.detail || err?.message || options.errorMsg);
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

    this.handleMutation(
      id ? this.service.update(id, data) : this.service.create(data),
      this.genre,
      {
        successMsg: id ? 'Género modificado correctamente' : 'Género creado correctamente',
        errorMsg: id ? 'Error al modificar el Género' : 'Error al crear el Género',
        onSuccess: () => this.getAllRX.reload(),
        onFinalize: () => {
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

    this.handleMutation(
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