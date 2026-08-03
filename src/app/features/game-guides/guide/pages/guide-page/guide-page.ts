import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { GameService } from '@features/game-guides/game/services/game-service';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { SelectSearchComponent } from "@shared/components/select-search-component/select-search-component";
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { SelectItemModel } from '@shared/models/select-item-model';
import { catchError, finalize, map, of } from 'rxjs';
import { GuideFormComponent } from "@features/game-guides/guide/components/guide-form-component/guide-form-component";
import { GuideModel, SaveGuideModel } from '@features/game-guides/guide/models/guide-model';
import { GuideService } from '../../services/guide-service';
import { ErrorService } from '@core/services/error-service';
import { PaginationNavComponent } from "@shared/components/pagination-nav-component/pagination-nav-component";
import { GuideListComponent } from "../../components/guide-list-component/guide-list-component";

@Component({
  selector: 'app-guide-page',
  imports: [
    NgOptimizedImage,
    ButtonComponent,
    SelectSearchComponent,
    GuideFormComponent,
    PaginationNavComponent,
    GuideListComponent
  ],
  templateUrl: './guide-page.html',
})
export class GuidePage {
  // STATES -----------------------------------------------------------------
  // ------------------------------------------------------------------------
  protected readonly showGuideFormModal = signal <boolean>(false);
  protected readonly clearTrigger = signal<number>(0);
  
  // ERROR SERVICE ----------------------------------------------------------
  // ------------------------------------------------------------------------
  private readonly errorService = inject(ErrorService);

  // GAME SERVICE -----------------------------------------------------------
  // ------------------------------------------------------------------------
  private readonly gameService = inject(GameService);
  private readonly getAllGamePayload = computed<PaginationRequestModel>(() => ({
    page: 1,
    limit: 100,
    search: "",
  }));
  protected readonly computedGameList = computed<SelectItemModel[]>(() => {
    const items = this.getAllGamesRX.value() ?? []
    return items.map(e => ({ id: e.id, name: e.name, img_url: e.cover_url}));
  });
  protected readonly selectedGame = signal<SelectItemModel | null>(null);

  // GAME GUIDE -------------------------------------------------------------
  // ------------------------------------------------------------------------
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  private readonly limit = signal<number>(5);
  private readonly search = signal<string>('');
  protected readonly isSavingGuide = signal<boolean>(false);

  private readonly guideService = inject(GuideService);
  private readonly getAllGuidePayload = computed<PaginationRequestModel<number>>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search(),
    filter: this.selectedGame()?.id
  }));
  protected readonly computedGuideList = computed<GuideModel[]>(() => this.getAllGuideByGameRX.value() ?? []);
  protected readonly saveGuidePayload = signal<GuideModel | null>(null);

  // GET RX -----------------------------------------------------------------
  // ------------------------------------------------------------------------
  protected readonly getAllGamesRX = rxResource({
    params: () => this.getAllGamePayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.gameService.getAllPagination(params).pipe(
        map(response => {
          return response.items;
        }),
        catchError(err => {
          console.error('[GameService::GamePage] getAllPagination:', err);
          this.errorService.show(err?.error?.detail || err?.message);
          return of([]);
        })
      );
    },
  });

  protected readonly getAllGuideByGameRX = rxResource({
    params: () => this.getAllGuidePayload(),
    stream: ({ params }) => {
      if (!params || !params.filter) return of(null);

      return this.guideService.getAllPagination(params).pipe(
        map(response => {
          return response.items;
        }),
        catchError(err => {
          console.error('[GameService::GamePage] getAllPagination:', err);
          this.errorService.show(err?.error?.detail || err?.message);
          return of([]);
        })
      );
    },
  });

  // GAME EVENTS ------------------------------------------------------------
  // ------------------------------------------------------------------------
  protected onGameSelected(item: SelectItemModel): void {
    this.selectedGame.set(item);
  }

  protected onGameClear(): void {
    this.selectedGame.set(null);
  }

  // GUIDE EVENTS -----------------------------------------------------------
  // ------------------------------------------------------------------------
  protected onEditGuide(item: GuideModel): void {
    this.saveGuidePayload.set(item);
    this.showGuideFormModal.set(true);
  }

  protected onCloseGuideModal(): void {
    this.showGuideFormModal.set(false)
    this.saveGuidePayload.set(null);
  }

  protected onSubmitGuide(item: SaveGuideModel): void {
    this.isSavingGuide.set(true);

    const id = this.saveGuidePayload()?.id
    const gameId = this.selectedGame()?.id
    if (!gameId || !item) return;

    const payload: SaveGuideModel = { ...item, game_id: gameId };
    const error = `Error al ${ id ? 'Modificar' : 'Crear' } la Guía`;

    const request$ = id
    ? this.guideService.update(id, payload)
    : this.guideService.create(payload);

    request$
    .pipe(
      finalize(() => {
        this.isSavingGuide.set(false);
        this.showGuideFormModal.set(false);
      })
    ).subscribe({
      next: () => {
        console.log(`Guia ${ id ? 'Modificada' : 'Guardada' } Correctamente`);
        this.getAllGuideByGameRX.reload();
      },
      error: (err) => {
        console.error(`[GuidePage] - OnSubmitGuide: ${ error }`, err);
        this.errorService.show(err?.error?.detail || err?.message || error);
      }
    });
  }

  // EVENTS -----------------------------------------------------------------
  // ------------------------------------------------------------------------
  protected onClear(): void {
    this.onGameClear();
    this.clearTrigger.update(e => e + 1);
  }

  protected prevPage(): void {
    if (this.currentPage() > 1){
      this.currentPage.update(e => e - 1);
    }
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages()){
      this.currentPage.update(e => e + 1);
    }
  }
}
