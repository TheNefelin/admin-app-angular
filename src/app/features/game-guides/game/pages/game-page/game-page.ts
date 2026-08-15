import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { GameModel } from '@features/game-guides/game/models/game-model';
import { GameService } from '@features/game-guides/game/services/game-service';
import { CrudPage } from '@shared/base/crud-page';
import { PaginationFilterComponent } from '@shared/components/pagination-filter-component/pagination-filter-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { PaginationNavComponent } from '@shared/components/pagination-nav-component/pagination-nav-component';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { Router } from '@angular/router';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { ConfirmService } from '@core/services/confirm-service';
import { MutationService } from '@core/services/mutation-service';

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
export class GamePage extends CrudPage<GameModel> {
  private readonly router = inject(Router);
  private readonly confirmService = inject(ConfirmService);
  private readonly mutation = inject(MutationService);

  protected readonly deleting = signal<boolean>(false);

  private readonly service = inject(GameService);
  protected readonly computedList = computed<GameModel[]>(() => this.getAllRX.value() ?? []);

  protected readonly getAllRX = rxResource({
    params: () => this.getAllPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.service.getAllPagination(params).pipe(
        map(response => this.mapPaginated(response)),
        catchError(err => {
          console.error('[GameService::GamePage] getAllPagination:', err);
          return of(this.emptyPaginated());
        })
      );
    },
  });

  protected override reload(): void {
    this.getAllRX.reload();
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

    this.mutation.run(
      this.service.delete(item.id),
      { isSaving: this.deleting },
      {
        successMsg: 'Eliminado correctamente',
        errorMsg: 'Error al eliminar el Game',
        onSuccess: () => this.getAllRX.reload(),
      }
    );
  }
}
