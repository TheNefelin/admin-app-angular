import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, finalize, map, of } from 'rxjs';
import { GenreModel, SaveGenreModel } from '@features/game-guides/genre/models/genre-model';
import { GenreService } from '@features/game-guides/genre/services/genre-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationFilterComponent } from "@shared/components/pagination-filter-component/pagination-filter-component";
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { PaginationNavComponent } from "@shared/components/pagination-nav-component/pagination-nav-component";
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { Router } from '@angular/router';
import { GenreFormComponent } from '@features/game-guides/genre/components/genre-form-component/genre-form-component';
import { SuccessService } from '@core/services/success-service';
import { ConfirmService } from '@core/services/confirm-service';

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
  private readonly router = inject(Router);
  private readonly successService = inject(SuccessService);
  private readonly confirmService = inject(ConfirmService);
  protected readonly showFormModal = signal<boolean>(false);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  private readonly limit = signal<number>(5);
  private readonly search = signal<string>('');
  protected readonly editItem = signal<GenreModel | null>(null);

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
          return of([]);
        })
      );
    },
  });

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
    this.editItem.set(null);
    this.showFormModal.set(true);
  }

  protected onEdit(item: GenreModel): void {
    this.editItem.set(item);
    this.showFormModal.set(true);
  }

  protected onCloseForm(): void {
    this.showFormModal.set(false);
  }

  protected onSubmitForm(data: SaveGenreModel): void {
    this.isSaving.set(true);

    const id = this.editItem()?.id;
    const request$ = id
      ? this.service.update(id, data)
      : this.service.create(data);

    request$.pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: () => {
        this.successService.show(id ? 'Modificado correctamente' : 'Creado correctamente');
        this.showFormModal.set(false);
        this.getAllRX.reload();
      },
      error: (err) => {
        console.error('[GenreService::GenrePage] onSubmitForm:', err);
      }
    });
  }

  protected async onDelete(item: GenreModel): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Genre',
      message: `Estás seguro que deseas eliminar (${item.name})`,
    });
    if (!confirmed) return;

    this.service.delete(item.id).subscribe({
      next: () => {
        this.successService.show('Eliminado correctamente');
        this.getAllRX.reload();
      },
      error: (err) => {
        console.error('[GenreService::GenrePage] onDelete:', err);
      }
    });
  }
}
