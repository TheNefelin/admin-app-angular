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
import { GuideService } from '@features/game-guides/guide/services/guide-service';
import { ErrorService } from '@core/services/error-service';
import { PaginationNavComponent } from "@shared/components/pagination-nav-component/pagination-nav-component";
import { GuideListComponent } from "@features/game-guides/guide/components/guide-list-component/guide-list-component";
import { SuccessService } from '@core/services/success-service';
import { ConfirmService } from '@core/services/confirm-service';
import { AdventureService } from '@features/game-guides/adventure/services/adventure-service';
import { AdventureModel, SaveAdventureModel } from '@features/game-guides/adventure/models/adventure-model';
import { AdventureFormComponent } from "@features/game-guides/adventure/components/adventure-form-component/adventure-form-component";
import { AdventureImageFormComponent } from "@features/game-guides/adventure-image/components/adventure-image-form-component/adventure-image-form-component";
import { SaveAdventureImageModel } from '@features/game-guides/adventure-image/models/adventure-image-model';
import { AdventureImageService } from '@features/game-guides/adventure-image/services/adventure-image-service';
import { PaginationFilterComponent } from "@shared/components/pagination-filter-component/pagination-filter-component";

@Component({
  selector: 'app-guide-page',
  imports: [
    NgOptimizedImage,
    ButtonComponent,
    SelectSearchComponent,
    GuideFormComponent,
    PaginationNavComponent,
    GuideListComponent,
    AdventureFormComponent,
    AdventureImageFormComponent,
    PaginationFilterComponent
  ],
  templateUrl: './guide-page.html',
})
export class GuidePage {
  // STATES -----------------------------------------------------------------
  // ------------------------------------------------------------------------
  protected readonly showGuideFormModal = signal<boolean>(false);
  protected readonly showAdventureFormModal = signal<boolean>(false);
  protected readonly showAdventureImageFormModal = signal<boolean>(false);
  protected readonly clearTrigger = signal<number>(0);
  
  // SERVICES ---------------------------------------------------------------
  // ------------------------------------------------------------------------
  private readonly errorService = inject(ErrorService);
  private readonly successService = inject(SuccessService);
  private readonly confirmService = inject(ConfirmService);

  // GAME SERVICE -----------------------------------------------------------
  // ------------------------------------------------------------------------
  private readonly gameService = inject(GameService);
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
  protected readonly guide = {
    savePayload: signal<GuideModel | null>(null),
    isSaving: signal<boolean>(false),
  };

  private readonly guideService = inject(GuideService);
  private readonly getAllGuidePayload = computed<PaginationRequestModel<number>>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search(),
    filter: this.selectedGame()?.id
  }));

  // GUIDE ADVENTURE --------------------------------------------------------
  // ------------------------------------------------------------------------
  protected readonly adventure = {
    savePayload: signal<{ guide_id: number; data: AdventureModel | null } | null>(null),
    isSaving: signal<boolean>(false),
  };

  private readonly adventureService = inject(AdventureService);

  // GUIDE ADVENTURE IMAGE --------------------------------------------------
  // ------------------------------------------------------------------------
  protected readonly adventureImage = {
    savePayload: signal<number | null>(null),
    isSaving: signal<boolean>(false),
  };

  private readonly adventureImageService = inject(AdventureImageService);

  // GET RX -----------------------------------------------------------------
  // ------------------------------------------------------------------------
  protected readonly getAllGamesRX = rxResource({
    stream: () => {
      const params: PaginationRequestModel = {
        page: 1,
        limit: 100,
        search: "",
      }

      return this.gameService.getAllPagination(params).pipe(
        map(response => {
          return response.items;
        }),
        catchError(err => {
          console.error('[GameService::GuidePage] getAllPagination:', err);
          this.errorService.show(err?.error?.detail || err?.message || 'Error al cargar los juegos');
          return of([]);
        })
      );
    },
  });

  protected readonly getAllDetailByGamePagination = rxResource({
    params: () => this.getAllGuidePayload(),
    stream: ({ params }) => {
      if (!params || !params.filter) return of(null);

      return this.guideService.getAllDetailByGamePagination(params).pipe(
        map(response => {
          this.totalPages.set(Math.ceil(response.total / this.limit()));
          return response.items;
        }),
        catchError(err => {
          console.error('[GuideService::GuidePage] getAllDetailByGamePagination:', err);
          this.errorService.show(err?.error?.detail || err?.message || 'Error al cargar las guías');
          return of([]);
        })
      );
    },
  });

  // GAME EVENTS ------------------------------------------------------------
  // ------------------------------------------------------------------------
  protected onGameSelected(item: SelectItemModel): void {
    this.selectedGame.set(item);
    this.currentPage.set(1);
  }

  protected onGameClear(): void {
    this.selectedGame.set(null);
    this.currentPage.set(1);
  }

  // GUIDE EVENTS -----------------------------------------------------------
  // ------------------------------------------------------------------------
  protected onCloseGuideModal(): void {
    this.showGuideFormModal.set(false)
    this.guide.savePayload.set(null);
  }

  protected onCreateGuideModal(): void{
    this.guide.savePayload.set(null);
    this.showGuideFormModal.set(true);
  }

  protected onEditGuideModal(item: GuideModel): void {
    this.guide.savePayload.set(item);
    this.showGuideFormModal.set(true);
  }

  protected async onDeleteGuide(item: GuideModel): Promise<void> {
    const id = item?.id;
    if (!id) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Guía',
      message: `¿Estás seguro de que deseas eliminar la guía "${item.title}"?`,
    });
    if (!confirmed) return;

    this.guide.isSaving.set(true);

    const error = `Error al Eliminar la Guía`;
    const success = 'Guia Eliminada Correctamente';

    this.guideService.delete(id)
    .pipe(
      finalize(() => {
        this.guide.isSaving.set(false);
      })
    ).subscribe({
      next: () => {
        this.successService.show(success);
        this.getAllDetailByGamePagination.reload();
      },
      error: (err) => {
        console.error(`[GuidePage] - onDeleteGuide: ${ error }`, err);
        this.errorService.show(err?.error?.detail || err?.message || error);
      }
    });
  }

  protected onSubmitGuide(item: SaveGuideModel): void {
    const id = this.guide.savePayload()?.id
    const gameId = this.selectedGame()?.id
    if (!gameId || !item) return;

    this.guide.isSaving.set(true);

    const payload: SaveGuideModel = { ...item, game_id: gameId };
    const error = `Error al ${ id ? 'Modificar' : 'Crear' } la Guía`;
    const success = `Guia ${ id ? 'Modificada' : 'Creada' } Correctamente`;

    const request$ = id
    ? this.guideService.update(id, payload)
    : this.guideService.create(payload);

    request$
    .pipe(
      finalize(() => {
        this.guide.isSaving.set(false);
        this.showGuideFormModal.set(false);
        this.guide.savePayload.set(null);
      })
    ).subscribe({
      next: () => {
        this.successService.show(success);
        this.getAllDetailByGamePagination.reload();
      },
      error: (err) => {
        console.error(`[GuidePage] - OnSubmitGuide: ${ error }`, err);
        this.errorService.show(err?.error?.detail || err?.message || error);
      }
    });
  }

  // ADVENTURE EVENTS -------------------------------------------------------
  // ------------------------------------------------------------------------
  protected onCloseAdventureModal(): void {
    this.showAdventureFormModal.set(false)
    this.adventure.isSaving.set(false);
    this.adventure.savePayload.set(null);
  }

  protected onCreateAdventureModal(guide_id: number): void{
    this.adventure.savePayload.set({ guide_id: guide_id, data: null });
    this.showAdventureFormModal.set(true);
  }

  protected onEditAdventureModal(item: AdventureModel): void {
    this.adventure.savePayload.set({ guide_id: item.guide_id, data: item });
    this.showAdventureFormModal.set(true);
  }

  protected async onDeleteAdventure(data: AdventureModel): Promise<void> {
    if (!data.id) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Aventura',
      message: `¿Estás seguro de que deseas eliminar la Aventura "Id ${data.id} - Sort ${data.sort_order}"?`,
    });
    if (!confirmed) return;

    this.adventure.isSaving.set(true);
    const error = `Error al Eliminar la Aventura`;
    const success = `Aventura Eliminada Correctamente`;

    this.adventureService.delete(data.id)
    .pipe(
      finalize(() => {
        this.adventure.isSaving.set(false);
      })
    ).subscribe({
      next: () => {
        this.successService.show(success);
        this.getAllDetailByGamePagination.reload();
      },
      error: (err) => {
        console.error(`[GuidePage] - onDeleteAdventure: ${ error }`, err);
        this.errorService.show(err?.error?.detail || err?.message || error);
      }
    });
  }

  protected onSubmitAdventure(item: SaveAdventureModel): void {
    const adventureId = this.adventure.savePayload()?.data?.id
    const guideId = this.adventure.savePayload()?.guide_id
    if (!guideId || !item) return;

    this.adventure.isSaving.set(true);

    const payload: SaveAdventureModel = { ...item, guide_id: guideId };
    const error = `Error al ${ adventureId ? 'Modificar' : 'Crear' } la Aventura`;
    const success = `Aventura ${ adventureId ? 'Modificada' : 'Creada' } Correctamente`;

    const request$ = adventureId
    ? this.adventureService.update(adventureId, payload)
    : this.adventureService.create(payload);

    request$
    .pipe(
      finalize(() => {
        this.onCloseAdventureModal();
      })
    ).subscribe({
      next: () => {
        this.successService.show(success);
        this.getAllDetailByGamePagination.reload();
      },
      error: (err) => {
        console.error(`[GuidePage] - onSubmitAdventure: ${ error }`, err);
        this.errorService.show(err?.error?.detail || err?.message || error);
      }
    });
  }

  // ADVENTURE IMAGE EVENTS -------------------------------------------------
  // ------------------------------------------------------------------------
  protected onCloseAdventureImageModal(): void {
    this.showAdventureImageFormModal.set(false)
    this.adventureImage.isSaving.set(false);
    this.adventureImage.savePayload.set(null)
  }

  protected onOpenAdventureImageModal(adventure_id: number): void {
    this.adventureImage.savePayload.set(adventure_id);
    this.showAdventureImageFormModal.set(true)
  }

  protected async onDeleteAdventureImage(data: { id: number, alt: string }): Promise<void> {
    if (!data.id) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Imagen',
      message: `¿Estás seguro de que deseas eliminar la Imagen "${data.alt}"?`,
    });
    if (!confirmed) return;

    this.adventureImage.isSaving.set(true);
    const error = `Error al Eliminar la Imagen de la Aventura`;
    const success = `Imagen de la aventura Eliminada Correctamente`;

    this.adventureImageService.deleteImage(data.id)
    .pipe(
      finalize(() => {
        this.adventureImage.isSaving.set(false);
      })
    ).subscribe({
      next: () => {
        this.successService.show(success);
        this.getAllDetailByGamePagination.reload();
      },
      error: (err) => {
        console.error(`[GuidePage] - onDeleteAdventureImage: ${ error }`, err);
        this.errorService.show(err?.error?.detail || err?.message || error);
      }
    });
  }
  
  protected onSubmitAdventureImage(item: SaveAdventureImageModel): void {
    const adventure_id = this.adventureImage.savePayload();
    if (!adventure_id || !item) return;

    this.adventureImage.isSaving.set(true);

    const payload: SaveAdventureImageModel = { ...item, adventure_id: adventure_id };
    const error = `Error al cargar la imagen de la Aventura`;
    const success = `Imagen de la Aventura Subida Correctamente`;

    this.adventureImageService.uploadImage(payload)
    .pipe(
      finalize(() => {
        this.onCloseAdventureImageModal();
      })
    ).subscribe({
      next: () => {
        this.successService.show(success);
        this.getAllDetailByGamePagination.reload();
      },
      error: (err) => {
        console.error(`[GuidePage] - onSubmitAdventureImage: ${ error }`, err);
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

  protected onRefreshClick(): void {
    this.getAllDetailByGamePagination.reload();
  }

  protected onFilterChange(filter: { search: string; limit: number }): void {
    this.search.set(filter.search);
    this.limit.set(filter.limit);
    this.currentPage.set(1);
  }
}
