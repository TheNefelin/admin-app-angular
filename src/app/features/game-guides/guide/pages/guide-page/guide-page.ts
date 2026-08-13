import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal, type WritableSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { GameService } from '@features/game-guides/game/services/game-service';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { SelectSearchComponent } from '@shared/components/select-search-component/select-search-component';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { SelectItemModel } from '@shared/models/select-item-model';
import { catchError, finalize, map, of, type Observable } from 'rxjs';
import { GuideFormComponent } from '@features/game-guides/guide/components/guide-form-component/guide-form-component';
import { GuideModel, SaveGuideModel } from '@features/game-guides/guide/models/guide-model';
import { GuideService } from '@features/game-guides/guide/services/guide-service';
import { ErrorService } from '@core/services/error-service';
import { PaginationNavComponent } from '@shared/components/pagination-nav-component/pagination-nav-component';
import { GuideListComponent } from '@features/game-guides/guide/components/guide-list-component/guide-list-component';
import { SuccessService } from '@core/services/success-service';
import { ConfirmService } from '@core/services/confirm-service';
import { AdventureService } from '@features/game-guides/adventure/services/adventure-service';
import { AdventureModel, SaveAdventureModel } from '@features/game-guides/adventure/models/adventure-model';
import { AdventureFormComponent } from '@features/game-guides/adventure/components/adventure-form-component/adventure-form-component';
import { AdventureImageFormComponent } from '@features/game-guides/adventure-image/components/adventure-image-form-component/adventure-image-form-component';
import { SaveAdventureImageModel } from '@features/game-guides/adventure-image/models/adventure-image-model';
import { AdventureImageService } from '@features/game-guides/adventure-image/services/adventure-image-service';
import { PaginationFilterComponent } from '@shared/components/pagination-filter-component/pagination-filter-component';

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
    const items = this.getAllGamesRX.value() ?? [];
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
      };

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
        console.error(`[GuidePage] ${options.errorMsg}:`, err);
        this.errorService.show(err?.error?.detail || err?.message || options.errorMsg);
      }
    });
  }

  // GUIDE EVENTS -----------------------------------------------------------
  // ------------------------------------------------------------------------
  protected onCloseGuideModal(): void {
    this.showGuideFormModal.set(false);
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

    this.handleMutation(
      this.guideService.delete(id),
      this.guide,
      {
        successMsg: 'Guía eliminada correctamente',
        errorMsg: 'Error al eliminar la Guía',
        onSuccess: () => this.getAllDetailByGamePagination.reload(),
      }
    );
  }

  protected onSubmitGuide(item: SaveGuideModel): void {
    const id = this.guide.savePayload()?.id;
    const gameId = this.selectedGame()?.id;
    if (!gameId || !item) return;

    const payload: SaveGuideModel = { ...item, game_id: gameId };

    this.handleMutation(
      id
        ? this.guideService.update(id, payload)
        : this.guideService.create(payload),
      this.guide,
      {
        successMsg: `Guía ${ id ? 'modificada' : 'creada' } correctamente`,
        errorMsg: `Error al ${ id ? 'modificar' : 'crear' } la Guía`,
        onSuccess: () => this.getAllDetailByGamePagination.reload(),
        onFinalize: () => {
          this.showGuideFormModal.set(false);
          this.guide.savePayload.set(null);
        },
      }
    );
  }

  // ADVENTURE EVENTS -------------------------------------------------------
  // ------------------------------------------------------------------------
  protected onCloseAdventureModal(): void {
    this.showAdventureFormModal.set(false);
    this.adventure.savePayload.set(null);
  }

  protected onCreateAdventureModal(guideId: number): void{
    this.adventure.savePayload.set({ guide_id: guideId, data: null });
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

    this.handleMutation(
      this.adventureService.delete(data.id),
      this.adventure,
      {
        successMsg: 'Aventura eliminada correctamente',
        errorMsg: 'Error al eliminar la Aventura',
        onSuccess: () => this.getAllDetailByGamePagination.reload(),
      }
    );
  }

  protected onSubmitAdventure(item: SaveAdventureModel): void {
    const adventureId = this.adventure.savePayload()?.data?.id
    const guideId = this.adventure.savePayload()?.guide_id
    if (!guideId || !item) return;

    const payload: SaveAdventureModel = { ...item, guide_id: guideId };

    this.handleMutation(
      adventureId
        ? this.adventureService.update(adventureId, payload)
        : this.adventureService.create(payload),
      this.adventure,
      {
        successMsg: `Aventura ${ adventureId ? 'modificada' : 'creada' } correctamente`,
        errorMsg: `Error al ${ adventureId ? 'modificar' : 'crear' } la Aventura`,
        onSuccess: () => this.getAllDetailByGamePagination.reload(),
        onFinalize: () => this.onCloseAdventureModal(),
      }
    );
  }

  // ADVENTURE IMAGE EVENTS -------------------------------------------------
  // ------------------------------------------------------------------------
  protected onCloseAdventureImageModal(): void {
    this.showAdventureImageFormModal.set(false);
    this.adventureImage.savePayload.set(null);
  }

  protected onOpenAdventureImageModal(adventureId: number): void {
    this.adventureImage.savePayload.set(adventureId);
    this.showAdventureImageFormModal.set(true);
  }

  protected async onDeleteAdventureImage(data: { id: number, alt: string }): Promise<void> {
    if (!data.id) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Imagen',
      message: `¿Estás seguro de que deseas eliminar la Imagen "${data.alt}"?`,
    });
    if (!confirmed) return;

    this.handleMutation(
      this.adventureImageService.deleteImage(data.id),
      this.adventureImage,
      {
        successMsg: 'Imagen de la aventura eliminada correctamente',
        errorMsg: 'Error al eliminar la Imagen de la Aventura',
        onSuccess: () => this.getAllDetailByGamePagination.reload(),
      }
    );
  }
  
  protected onSubmitAdventureImage(item: SaveAdventureImageModel): void {
    const adventureId = this.adventureImage.savePayload();
    if (!adventureId || !item) return;

    const payload: SaveAdventureImageModel = { ...item, adventure_id: adventureId };

    this.handleMutation(
      this.adventureImageService.uploadImage(payload),
      this.adventureImage,
      {
        successMsg: 'Imagen de la Aventura subida correctamente',
        errorMsg: 'Error al cargar la imagen de la Aventura',
        onSuccess: () => this.getAllDetailByGamePagination.reload(),
        onFinalize: () => this.onCloseAdventureImageModal(),
      }
    );
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
