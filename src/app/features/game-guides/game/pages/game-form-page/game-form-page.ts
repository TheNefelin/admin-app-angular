import { Component, computed, inject, signal, type WritableSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { GameDetailModel, SaveGameModel } from '@features/game-guides/game/models/game-model';
import { GameService } from '@features/game-guides/game/services/game-service';
import { GenreService } from '@features/game-guides/genre/services/genre-service';
import { PlatformService } from '@features/game-guides/platform/services/platform-service';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { catchError, finalize, map, Observable, of, switchMap } from 'rxjs';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectItemModel } from '@shared/models/select-item-model';
import { ImageListComponent } from '@features/game-guides/game/components/image-list-component/image-list-component';
import { ScreenshotService } from '@features/game-guides/screenshot/services/screenshot-service';
import { SaveScreenshotModel } from '@features/game-guides/screenshot/models/screenshot-model';
import { SaveMapModel } from '@features/game-guides/map/models/map-model';
import { MapService } from '@features/game-guides/map/services/map-service';
import { GameFormComponent } from '@features/game-guides/game/components/game-form-component/game-form-component';
import { SaveSourceModel, SourceModel } from '@features/game-guides/source/models/source-model';
import { SourceService } from '@features/game-guides/source/services/source-service';
import { SourcesListComponent } from '@features/game-guides/source/components/source-list-component/sources-list-component';
import { ScreenshotFormComponent } from '@features/game-guides/screenshot/components/screenshot-form-component/screenshot-form-component';
import { MapFormComponent } from '@features/game-guides/map/components/map-form-component/map-form-component';
import { SourceFormComponent } from '@features/game-guides/source/components/source-form-component/source-form-component';
import { CharacterFormComponent } from '@features/game-guides/character/components/character-form-component/character-form-component';
import { CharacterListComponent } from '@features/game-guides/character/components/character-list-component/character-list-component';
import { CharacterService } from '@features/game-guides/character/services/character-service';
import { CharacterModel, SaveCharacterModel } from '@features/game-guides/character/models/character-model';
import { SuccessService } from '@core/services/success-service';
import { ConfirmService } from '@core/services/confirm-service';

@Component({
  selector: 'app-game-form-page',
  imports: [
    LoadingComponent,
    ButtonComponent,
    ImageListComponent,
    GameFormComponent,
    SourcesListComponent,
    SourceFormComponent,
    CharacterFormComponent,
    CharacterListComponent,
    ScreenshotFormComponent,
    MapFormComponent,
  ],
  templateUrl: './game-form-page.html',
})
export class GameFormPage {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly successService = inject(SuccessService);
  private readonly confirmService = inject(ConfirmService);

  readonly routeId = toSignal(
    this.activatedRoute.paramMap.pipe(
      map(params => Number(params.get('id')) || 0)
    ),
    { initialValue: 0 }
  );

  protected readonly isLoading = computed<boolean>(() =>
    [
      this.gameRX,
      this.platformListRX,
      this.genreListRX,
    ].some(e => e.isLoading())
  );

  protected readonly isEditMode = computed(() => this.routeId() > 0);

  // SERVICES -------------------------------------------------------
  // ----------------------------------------------------------------

  // GAME -------------------------------------------------------------
  private readonly gameService = inject(GameService);
  private readonly gameIdPayload = computed(() => this.routeId());
  protected readonly gameComputed = computed<GameDetailModel | null>(() => this.gameRX.value() ?? null);
  protected readonly game = {
    isSaving: signal<boolean>(false),
  };

  // PLATFORM ---------------------------------------------------------
  private readonly platformService = inject(PlatformService);
  protected readonly platformListComputed = computed<SelectItemModel[]>(() => {
    const items = this.platformListRX.value() ?? [];
    return items.map(e => ({ id: e.id, name: e.name, img_url: null }));
  });

  // GENRE ------------------------------------------------------------
  private readonly genreService = inject(GenreService);
  protected readonly genreListComputed = computed<SelectItemModel[]>(() => {
    const items = this.genreListRX.value() ?? [];
    return items.map(e => ({ id: e.id, name: e.name, img_url: null }));
  });

  // SOURCES -----------------------------------------------------------
  private readonly sourceService = inject(SourceService);
  protected readonly source = {
    savePayload: signal<SourceModel | null>(null),
    resetTrigger: signal<number>(0),
    isSaving: signal<boolean>(false),
    showForm: signal<boolean>(false),
  };

  // CHARACTERS --------------------------------------------------------
  private readonly characterService = inject(CharacterService);
  protected readonly character = {
    savePayload: signal<CharacterModel | null>(null),
    resetTrigger: signal<number>(0),
    isSaving: signal<boolean>(false),
    showForm: signal<boolean>(false),
  };

  // SCREENCHOTS AND MAPS ----------------------------------------------
  private readonly screenshotService = inject(ScreenshotService);
  private readonly mapService = inject(MapService);
  protected readonly screenshot = {
    isSaving: signal<boolean>(false),
    showForm: signal<boolean>(false),
  };
  protected readonly map = {
    isSaving: signal<boolean>(false),
    showForm: signal<boolean>(false),
  };

  // GETS -----------------------------------------------------------
  // ----------------------------------------------------------------

  protected readonly gameRX = rxResource({
    params: () => this.gameIdPayload(),
    stream: ({ params: id }) => {
      if (!id) return of(null);

      return this.gameService.getDetailById(id).pipe(
        catchError(err => {
          console.error('[GameService::GameFormPage] getDetailById:', err);
          return of(null);
        })
      );
    },
  });

  protected readonly platformListRX = rxResource({
    stream: () => {
      return this.platformService.getAllPagination({ page: 1, limit: 100 }).pipe(
        map(res => res.items),
        catchError(err => {
          console.error('[PlatformService::GameFormPage] getAll:', err);
          return of([]);
        })
      );
    },
  });

  protected readonly genreListRX = rxResource({
    stream: () => {
      return this.genreService.getAllPagination({ page: 1, limit: 100 }).pipe(
        map(res => res.items),
        catchError(err => {
          console.error('[GenreService::GameFormPage] getAll:', err);
          return of([]);
        })
      );
    },
  });

  // FORM -----------------------------------------------------------
  // ----------------------------------------------------------------
  
  protected onSubmit(payload: { data: SaveGameModel; file: File | null }): void {
    this.game.isSaving.set(true);
    const data = { ...payload.data, name: payload.data.name.trim(), slug: payload.data.slug.trim() };
    const file = payload.file;
    const id = this.gameIdPayload();

    const request$ = id
      ? this.gameService.update(id, data)
      : this.gameService.create(data);

    request$.pipe(
      switchMap(result => {
        if (file)
          return this.gameService.uploadImage(result.id, file);

        return of(result);
      }),
      finalize(() => {
        this.gameRX.reload();
        this.game.isSaving.set(false);
      })
    ).subscribe({
      next: (result) => {
        this.successService.show('Guardado correctamente');
        if (!id && result) {
          this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.GAME_GUIDE.GAME.FORM, result.id]);
        }
      },
      error: (err) => {
        console.error('[GameService::GameFormPage] onSubmitForm:', err);
      }
    });
  }

  protected onDeleteImage(): void {
    const id = this.gameIdPayload();
    if (!id) return;

    this.game.isSaving.set(true);

    this.gameService.deleteImage(id).pipe(
      finalize(() => this.game.isSaving.set(false))
    ).subscribe({
      next: () => {
        this.gameRX.reload();
      },
      error: (err) => {
        console.error('[GameService::GameFormPage] onDeleteImage:', err);
      }
    });
  }

  // SCREENCHOTS AND MAPS -------------------------------------------
  // ----------------------------------------------------------------

  private handleImageAction<T>(
    action: Observable<T>,
    loading: WritableSignal<boolean>,
    successMsg: string,
    errorMsg: string,
    options?: { onSuccess?: () => void },
  ): void {
    loading.set(true);
    action.pipe(
      finalize(() => {
        loading.set(false);
        this.gameRX.reload();
      })
    ).subscribe({
      next: () => {
        this.successService.show(successMsg);
        options?.onSuccess?.();
      },
      error: (err) => {
        console.error(`[GameFormPage] ${errorMsg}:`, err);
      }
    });
  }

  // SOURCES / CHARACTERS ------------------------------------------
  // ----------------------------------------------------------------

  private handleCrudAction<T>(
    action: Observable<T>,
    options: {
      loading: WritableSignal<boolean>;
      successMsg?: string;
      errorMsg: string;
      reloadOnSuccess?: boolean;
      onSuccess?: () => void;
      onClose?: () => void;
      onFinalize?: () => void;
    },
  ): void {
    let succeeded = false;
    options.loading.set(true);
    action.pipe(
      finalize(() => {
        options.loading.set(false);
        if (succeeded) options.onClose?.();
        options.onFinalize?.();
      })
    ).subscribe({
      next: () => {
        succeeded = true;
        if (options.successMsg) this.successService.show(options.successMsg);
        if (options.reloadOnSuccess) this.gameRX.reload();
        options.onSuccess?.();
      },
      error: (err) => {
        console.error(`[GameFormPage] ${options.errorMsg}:`, err);
      }
    });
  }

  protected onUploadScreenshot(item: SaveScreenshotModel): void {
    const game = this.gameComputed();
    if (!game) return;

    const data: SaveScreenshotModel = {
      ...item,
      game_id: game.id,
    };

    this.handleImageAction(
      this.screenshotService.create(data),
      this.screenshot.isSaving,
      'Screenshot guardado',
      'Error al guardar screenshot',
      { onSuccess: () => this.screenshot.showForm.set(false) }
    );
  }

  protected onDeleteScreenshot(id: number): void {
    this.handleImageAction(
      this.screenshotService.delete(id),
      this.screenshot.isSaving,
      'Screenshot eliminado',
      'Error al eliminar screenshot'
    );
  }

  protected onUploadMap(item: SaveMapModel): void {
    const game = this.gameComputed();
    if (!game) return;

    const data: SaveMapModel = {
      ...item,
      game_id: game.id,
    };

    this.handleImageAction(
      this.mapService.create(data),
      this.map.isSaving,
      'Map guardado',
      'Error al guardar Map',
      { onSuccess: () => this.map.showForm.set(false) }
    );
  }

  protected onDeleteMap(id: number): void {
    this.handleImageAction(
      this.mapService.delete(id),
      this.map.isSaving,
      'Map eliminado',
      'Error al eliminar Map'
    );
  }
  
  // SOURCES --------------------------------------------------------
  // ----------------------------------------------------------------

  protected onClearSource(): void {
    this.source.showForm.set(false);
    this.source.savePayload.set(null);
    this.source.resetTrigger.update(v => v + 1);
  }

  protected onEditSource(item: SourceModel): void {
    this.source.savePayload.set(item);
    this.source.showForm.set(true);
  }

  protected async onDeleteSource(item: SourceModel): Promise<void> {
    const id = item.id;
    if (!id) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Fuente',
      message: `Estás seguro que deseas eliminar (${item.name})`,
    });
    if (!confirmed) return;

    this.handleCrudAction(
      this.sourceService.delete(id),
      { loading: this.source.isSaving, successMsg: 'Fuente eliminada correctamente', errorMsg: 'Error al eliminar la fuente', reloadOnSuccess: true }
    );
  }

  protected onSubmitSource(item: SaveSourceModel): void {
    const game = this.gameComputed();
    if (!game) return;

    const sourceId = this.source.savePayload()?.id;

    const data: SaveSourceModel = {
      ...item,
      game_id: game.id,
    };

    const request$ = sourceId
      ? this.sourceService.update(sourceId, data)
      : this.sourceService.create(data);

    this.handleCrudAction(
      request$,
      {
        loading: this.source.isSaving,
        successMsg: sourceId ? 'Fuente modificada correctamente' : 'Fuente creada correctamente',
        errorMsg: sourceId ? 'Error al modificar la Fuente' : 'Error al crear la Fuente',
        reloadOnSuccess: true,
        onClose: () => this.onClearSource(),
      }
    );
  }

  // CHARACTER ------------------------------------------------------
  // ----------------------------------------------------------------

  protected onClearCharacter(): void {
    this.character.showForm.set(false);
    this.character.savePayload.set(null);
    this.character.resetTrigger.update(v => v + 1);
  }
  
  protected onDeleteCharacterImage(characterId: number): void {
    if (!characterId) return;

    this.handleImageAction(
      this.characterService.deleteImage(characterId),
      this.character.isSaving,
      'Imagen eliminada correctamente',
      'Error al eliminar la imagen'
    );
  }

  protected onEditCharacter(item: CharacterModel): void {
    this.character.savePayload.set(item);
    this.character.showForm.set(true);
  }  

  protected async onDeleteCharacter(item: CharacterModel): Promise<void> {
    const id = item.id;
    if (!id) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Personaje',
      message: `Estás seguro que deseas eliminar (${item.name})`,
    });
    if (!confirmed) return;

    this.handleCrudAction(
      this.characterService.delete(id),
      { loading: this.character.isSaving, successMsg: 'Personaje eliminado correctamente', errorMsg: 'Error al eliminar el Personaje', reloadOnSuccess: true }
    );
  }

  protected onSubmitCharacter(payload: { id: number, data: SaveCharacterModel, file: File | null }): void {
    const game = this.gameComputed();
    if (!game) return;

    const { id, data, file } = payload;

    const saveData: SaveCharacterModel = {
      ...data,
      game_id: game.id,
    };

    const request$ = id
      ? this.characterService.update(id, saveData)
      : this.characterService.create(saveData);

    const action$ = request$.pipe(
      switchMap(result => file
        ? this.characterService.uploadImage(result.id, file)
        : of(result))
    );

    this.handleCrudAction(
      action$,
      {
        loading: this.character.isSaving,
        successMsg: id ? 'Personaje modificado correctamente' : 'Personaje creado correctamente',
        errorMsg: 'Error al guardar el personaje',
        reloadOnSuccess: true,
        onSuccess: () => this.onClearCharacter(),
      }
    );
  }

  // ACTIONS --------------------------------------------------------
  // ----------------------------------------------------------------

  protected goToGame(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.GAME_GUIDE.GAME.ROOT]);
  }
}
