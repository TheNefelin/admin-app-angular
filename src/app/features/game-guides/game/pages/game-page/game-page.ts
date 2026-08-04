import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, finalize, map, of } from 'rxjs';
import { GameModel } from '@features/game-guides/game/models/game-model';
import { GameService } from '@features/game-guides/game/services/game-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationFilterComponent } from "@shared/components/pagination-filter-component/pagination-filter-component";
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { PaginationNavComponent } from "@shared/components/pagination-nav-component/pagination-nav-component";
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { Router } from '@angular/router';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { SuccessService } from '@core/services/success-service';
import { ConfirmService } from '@core/services/confirm-service';

@Component({
  selector: 'app-game-page',
  imports: [
    DatePipe,
    NgOptimizedImage,
    PaginationFilterComponent,
    ButtonComponent,
    LoadingComponent,
    PaginationNavComponent,
  ],
  templateUrl: './game-page.html',
})
export class GamePage {
  private readonly router = inject(Router);
  private readonly successService = inject(SuccessService);
  private readonly confirmService = inject(ConfirmService);
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  private readonly limit = signal<number>(5);
  private readonly search = signal<string>('');
  protected readonly editItem = signal<GameModel | null>(null);

  private readonly service = inject(GameService);
  private readonly getAllPayload = computed<PaginationRequestModel>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search()
  }));
  protected readonly computedList = computed<GameModel[]>(() => this.getAllRX.value() ?? []);

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
          console.error('[GameService::GamePage] getAllPagination:', err);
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
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.GAME_GUIDE.GAME.FORM]);
  }

  protected onEdit(item: GameModel): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.GAME_GUIDE.GAME.FORM, item.id]);
  }

  protected async onDelete(item: GameModel): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Game',
      message: `Estás seguro que deseas eliminar (${item.name})`,
    });
    if (!confirmed) return;

    this.service.delete(item.id).subscribe({
      next: () => {
        this.successService.show('Eliminado correctamente');
        this.getAllRX.reload();
      },
      error: (err) => {
        console.error('[GameService::GamePage] onDelete:', err);
      }
    });
  }
}
