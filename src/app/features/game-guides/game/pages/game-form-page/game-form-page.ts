import { Component, computed, inject, signal, type WritableSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { GameDetailModel, SaveGameModel } from '@features/game-guides/game/models/game-model';
import { GameService } from '@features/game-guides/game/services/game-service';
import { GenreService } from '@features/game-guides/genre/services/genre-service';
import { PlatformService } from '@features/game-guides/platform/services/platform-service';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { catchError, finalize, map, Observable, of, switchMap } from 'rxjs';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectItemModel } from '@shared/models/select-item-model';
import { ImageListComponent } from '@features/game-guides/game/components/image-list-component/image-list-component';
import { ScreenshotService } from '@features/game-guides/screenshot/services/screenshot-service';
import { SaveScreenshotModel } from '@features/game-guides/screenshot/models/screenshot-model';
import { SaveMapModel } from '@features/game-guides/map/models/map-model';
import { MapService } from '@features/game-guides/map/services/map-service';
import { GameFormComponent } from "@features/game-guides/game/components/game-form-component/game-form-component";
import { SourcesFormComponent } from "@features/game-guides/source/components/source-form-component/source-form-component";
import { SaveSourceModel, SourceModel } from '@features/game-guides/source/models/source-model';
import { SourceService } from '@features/game-guides/source/services/source-service';
import { SourcesListComponent } from "@features/game-guides/source/components/source-list-component/sources-list-component";
import { ImageFormComponent } from "../../components/image-form-component/image-form-component";
import { CharacterFormComponent } from '@features/game-guides/character/components/character-form-component/character-form-component';
import { CharacterListComponent } from '@features/game-guides/character/components/character-list-component/character-list-component';
import { CharacterService } from '@features/game-guides/character/services/character-service';
import { CharacterModel, SaveCharacterModel } from '@features/game-guides/character/models/character-model';
import { ErrorService } from '@core/services/error-service';
import { SuccessService } from '@core/services/success-service';
import { ConfirmService } from '@core/services/confirm-service';

@Component({
  selector: 'app-game-form-page',
  imports: [
    LoadingComponent,
    ButtonComponent,
    ImageFormComponent,
    ImageListComponent,
    GameFormComponent,
    SourcesFormComponent,
    SourcesListComponent,
    CharacterFormComponent,
    CharacterListComponent,
],
  templateUrl: './game-form-page.html',
})
export class GameFormPage {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  protected readonly errorService = inject(ErrorService);
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

  protected readonly isSavingGame = signal<boolean>(false);
  protected readonly isSavingImage = signal<boolean>(false);
  protected readonly isEditMode = computed(() => this.routeId() > 0);

  // SERVICES -------------------------------------------------------
  // ----------------------------------------------------------------

  // GAME -------------------------------------------------------------
  private readonly gameService = inject(GameService);
  private readonly gameIdPayload = computed(() => this.routeId());
  protected readonly gameComputed = computed<GameDetailModel | null>(() => this.gameRX.value() ?? null);

  // PLATFORM ---------------------------------------------------------
  private readonly platformService = inject(PlatformService);
  protected readonly platformListComputed = computed<SelectItemModel[]>(() => {
    const items = this.platformListRX.value() ?? []
    return items.map(e => ({ id: e.id, name: e.name, img_url: null }));
  });

  // GENRE ------------------------------------------------------------
  private readonly genreService = inject(GenreService);
  protected readonly genreListComputed = computed<SelectItemModel[]>(() => {
    const items = this.genreListRX.value() ?? []
    return items.map(e => ({ id: e.id, name: e.name, img_url: null }));
  });

  // SOURCES -----------------------------------------------------------
  private readonly sourceService = inject(SourceService)
  protected readonly source = {
    savePayload: signal<SourceModel | null>(null),
    resetTrigger: signal<number>(0),
    isSaving: signal<boolean>(false),
  };

  // CHARACTERS --------------------------------------------------------
  private readonly characterService = inject(CharacterService);
  protected readonly character = {
    savePayload: signal<CharacterModel | null>(null),
    resetTrigger: signal<number>(0),
    isSaving: signal<boolean>(false),
  };

  // SCREENCHOTS AND MAPS ----------------------------------------------
  private readonly screenshotService = inject(ScreenshotService);
  private readonly mapService = inject(MapService);

  // GETS -----------------------------------------------------------
  // ----------------------------------------------------------------

  protected readonly gameRX = rxResource({
    params: () => this.gameIdPayload(),
    stream: ({ params: id }) => {
      if (!id) return of(null);

      return this.gameService.getDetailById(id).pipe(
        catchError(err => {
          console.error('[GameService::GameFormPage] getDetailById:', err);
          this.errorService.show('Error al cargar el juego');
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
          this.errorService.show('Error al cargar plataformas');
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
          this.errorService.show('Error al cargar géneros');
          return of([]);
        })
      );
    },
  });

  // FORM -----------------------------------------------------------
  // ----------------------------------------------------------------
  
  protected onSubmit(payload: { data: SaveGameModel; file: File | null }): void {
    this.isSavingGame.set(true);
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
        this.isSavingGame.set(false)
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
        this.errorService.show(err?.error?.detail || err?.message || 'Error al guardar el juego');
      }
    });
  }

  protected onDeleteImage(): void {
    const id = this.gameIdPayload();
    if (!id) return;

    this.isSavingGame.set(true);

    this.gameService.deleteImage(id).pipe(
      finalize(() => this.isSavingGame.set(false))
    ).subscribe({
      next: () => {
        this.gameRX.reload();
      },
      error: (err) => {
        console.error('[GameService::GameFormPage] onDeleteImage:', err);
        this.errorService.show(err?.error?.detail || err?.message || 'Error al eliminar la imagen');
      }
    });
  }

  // SCREENCHOTS AND MAPS -------------------------------------------
  // ----------------------------------------------------------------

  private handleImageAction<T>(
    action: Observable<T>,
    successMsg: string,
    errorMsg: string,
  ): void {
    this.isSavingImage.set(true);
    action.pipe(
      finalize(() => {
        this.isSavingImage.set(false);
        this.gameRX.reload();
      })
    ).subscribe({
      next: () => this.successService.show(successMsg),
      error: (err) => {
        console.error(`[GameFormPage] ${errorMsg}:`, err);
        this.errorService.show(err?.error?.detail || err?.message || errorMsg);
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
      onFinalize?: () => void;
    },
  ): void {
    options.loading.set(true);
    action.pipe(
      finalize(() => {
        options.loading.set(false);
        options.onFinalize?.();
      })
    ).subscribe({
      next: () => {
        if (options.successMsg) this.successService.show(options.successMsg);
        if (options.reloadOnSuccess) this.gameRX.reload();
        options.onSuccess?.();
      },
      error: (err) => {
        console.error(`[GameFormPage] ${options.errorMsg}:`, err);
        this.errorService.show(err?.error?.detail || err?.message || options.errorMsg);
      }
    });
  }

  protected onUploadScreenshot(item: SaveScreenshotModel): void {
    const data: SaveScreenshotModel = {
      ...item,
      game_id: this.gameComputed()!.id
    }

    this.handleImageAction(
      this.screenshotService.create(data),
      'Screenshot guardado',
      'Error al guardar screenshot'
    );
  }

  protected onDeleteScreenshot(id: number): void {
    this.handleImageAction(
      this.screenshotService.delete(id),
      'Screenshot eliminado',
      'Error al eliminar screenshot'
    );
  }

  protected onUploadMap(item: SaveMapModel): void {
    const data: SaveMapModel = {
      ...item,
      game_id: this.gameComputed()!.id
    }

    this.handleImageAction(
      this.mapService.create(data),
      'Map guardado',
      'Error al guardar Map'
    );
  }

  protected onDeleteMap(id: number): void {
    this.handleImageAction(
      this.mapService.delete(id),
      'Map eliminado',
      'Error al eliminar Map'
    );
  }
  
  // SOURCES --------------------------------------------------------
  // ----------------------------------------------------------------

  protected onClearSource(): void {
    this.source.savePayload.set(null);
    this.source.resetTrigger.update(v => v + 1);
  }

  protected onEditSource(item: SourceModel): void {
    this.source.savePayload.set(item);
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
    const sourceId = this.source.savePayload()?.id;

    const data: SaveSourceModel = {
      ...item,
      game_id: this.gameComputed()!.id,
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
        onFinalize: () => this.onClearSource(),
      }
    );
  }

  // CHARACTER ------------------------------------------------------
  // ----------------------------------------------------------------

  protected onClearCharacter(): void {
    this.character.savePayload.set(null);
    this.character.resetTrigger.update(v => v + 1);
  }
  
  protected onDeleteCharacterImage(characterId: number): void {
    if (!characterId) return;

    this.handleImageAction(
      this.characterService.deleteImage(characterId),
      'Imagen eliminada correctamente',
      'Error al eliminar la imagen'
    );
  }

  protected onEditCharacter(item: CharacterModel): void {
    this.character.savePayload.set(item);
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
    const { id, data, file } = payload;

    const saveData: SaveCharacterModel = {
      ...data,
      game_id: this.gameComputed()!.id,
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
