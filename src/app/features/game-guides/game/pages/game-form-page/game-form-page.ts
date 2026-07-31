import { Component, computed, inject, signal, type WritableSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { GameModel, SaveGameModel } from '@features/game-guides/game/models/game-model';
import { GameService } from '@features/game-guides/game/services/game-service';
import { GenreService } from '@features/game-guides/genre/services/genre-service';
import { PlatformService } from '@features/game-guides/platform/services/platform-service';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { catchError, finalize, map, Observable, of, switchMap } from 'rxjs';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectItemModel } from '@shared/models/select-item-model';
import { MessageSuccessComponent } from "@shared/components/message-success-component/message-success-component";
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

@Component({
  selector: 'app-game-form-page',
  imports: [
    LoadingComponent,
    ButtonComponent,
    MessageSuccessComponent,
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

  readonly routeId = toSignal(
    this.activatedRoute.paramMap.pipe(
      map(params => Number(params.get('id')) || 0)
    ),
    { initialValue: 0 }
  );

  readonly isLoading = computed<boolean>(() =>
    [
      this.getGameByIdRX,
      this.getAllPlatformRX,
      this.getAllGenreRX,
    ].some(e => e.isLoading())
  );

  protected readonly successMessage = signal<string | null>(null);
  protected readonly isEditMode = computed(() => this.routeId() > 0);

  private readonly serviceGame = inject(GameService);
  private readonly getGameByIdPayload = computed(() => this.routeId());
  protected readonly computedGame = computed<GameModel | null>(() => this.getGameByIdRX.value() ?? null);

  private readonly servicePlatform = inject(PlatformService);
  protected readonly computedPlatformList = computed<SelectItemModel[]>(() => {
    const items = this.getAllPlatformRX.value() ?? []
    return items.map(e => ({ id: e.id, name: e.name, img_url: null }));
  });

  private readonly serviceGenre = inject(GenreService);
  protected readonly computedGenreList = computed<SelectItemModel[]>(() => {
    const items = this.getAllGenreRX.value() ?? []
    return items.map(e => ({ id: e.id, name: e.name, img_url: null }));
  });

  // GAME -------------------------------------------------------------
  protected readonly isSaving = signal<boolean>(false);

  // IMAGES (screenshots + maps) ---------------------------------------
  protected readonly isSavingImage = signal<boolean>(false);

  // SOURCES -----------------------------------------------------------
  private readonly serviceSource = inject(SourceService)
  protected readonly source = {
    savePayload: signal<SourceModel | null>(null),
    isSaving: signal<boolean>(false),
  };

  // CHARACTERS --------------------------------------------------------
  private readonly characterService = inject(CharacterService);
  protected readonly character = {
    savePayload: signal<CharacterModel | null>(null),
    resetTrigger: signal<number>(0),
    isSaving: signal<boolean>(false),
  };

  private readonly serviceScreenshot = inject(ScreenshotService);
  private readonly serviceMap = inject(MapService);

  protected readonly getGameByIdRX = rxResource({
    params: () => this.getGameByIdPayload(),
    stream: ({ params: id }) => {
      if (!id) return of(null);

      return this.serviceGame.getById(id).pipe(
        catchError(err => {
          console.error('[GameService::GameFormPage] getById:', err);
          this.errorService.show('Error al cargar el juego');
          return of(null);
        })
      );
    },
  });

  protected readonly getAllPlatformRX = rxResource({
    stream: () => {
      return this.servicePlatform.getAllPagination({ page: 1, limit: 999 }).pipe(
        map(res => res.items),
        catchError(err => {
          console.error('[PlatformService::GameFormPage] getAll:', err);
          this.errorService.show('Error al cargar plataformas');
          return of([]);
        })
      );
    },
  });

  protected readonly getAllGenreRX = rxResource({
    stream: () => {
      return this.serviceGenre.getAllPagination({ page: 1, limit: 999 }).pipe(
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
    this.successMessage.set(null);

    this.isSaving.set(true);
    const data = { ...payload.data, name: payload.data.name.trim(), slug: payload.data.slug.trim() };
    const file = payload.file;
    const id = this.getGameByIdPayload();

    const request$ = id
      ? this.serviceGame.update(id, data)
      : this.serviceGame.create(data);

    request$.pipe(
      switchMap(result => {
        if (file)
          return this.serviceGame.uploadImage(result.id, file);

        return of(result);
      }),
      finalize(() => {
        this.getGameByIdRX.reload();
        this.isSaving.set(false)
      })
    ).subscribe({
      next: (result) => {
        this.successMessage.set('Guardado correctamente');
        if (!id && result) {
          this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.GAME_GUIDE.GAME.FORM, result.id]);
        }
      },
      error: (err) => {
        console.error('[GameService::GameFormPage] onSubmitForm:', err);
        this.errorService.show('Error al guardar el juego');
      }
    });
  }

  protected onDeleteImage(): void {
    const id = this.getGameByIdPayload();
    if (!id) return;

    this.isSaving.set(true);

    this.serviceGame.deleteImage(id).pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: () => {
        this.getGameByIdRX.reload();
      },
      error: (err) => {
        console.error('[GameService::GameFormPage] onDeleteImage:', err);
        this.errorService.show('Error al eliminar la imagen');
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
        this.getGameByIdRX.reload();
      })
    ).subscribe({
      next: () => this.successMessage.set(successMsg),
      error: (err) => {
        console.error(`[GameFormPage] ${errorMsg}:`, err);
        this.errorService.show(errorMsg);
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
        if (options.successMsg) this.successMessage.set(options.successMsg);
        if (options.reloadOnSuccess) this.getGameByIdRX.reload();
        options.onSuccess?.();
      },
      error: (err) => {
        console.error(`[GameFormPage] ${options.errorMsg}:`, err);
        this.errorService.show(options.errorMsg);
      }
    });
  }

  protected onUploadScreenshot(item: SaveScreenshotModel): void {
    const data: SaveScreenshotModel = {
      ...item,
      game_id: this.computedGame()!.id
    }

    this.handleImageAction(
      this.serviceScreenshot.create(data),
      'Screenshot guardado',
      'Error al guardar screenshot'
    );
  }

  protected onDeleteScreenshot(id: number): void {
    this.handleImageAction(
      this.serviceScreenshot.delete(id),
      'Screenshot eliminado',
      'Error al eliminar screenshot'
    );
  }

  protected onUploadMap(item: SaveMapModel): void {
    const data: SaveMapModel = {
      ...item,
      game_id: this.computedGame()!.id
    }

    this.handleImageAction(
      this.serviceMap.create(data),
      'Map guardado',
      'Error al guardar Map'
    );
  }

  protected onDeleteMap(id: number): void {
    this.handleImageAction(
      this.serviceMap.delete(id),
      'Map eliminado',
      'Error al eliminar Map'
    );
  }
  
  // SOURCES --------------------------------------------------------
  // ----------------------------------------------------------------

  protected onClearSource(): void {
    this.source.savePayload.set(null);
  }

  protected onEditSource(item: SourceModel): void {
    this.source.savePayload.set(item);
  }

  protected onDeleteSource(item: SourceModel): void {
    const id = item.id;
    if (!id) return;

    this.handleCrudAction(
      this.serviceSource.delete(id),
      { loading: this.source.isSaving, errorMsg: 'Error al eliminar la fuente', reloadOnSuccess: true }
    );
  }

  protected onSubmitSource(item: SaveSourceModel): void {
    const sourceId = this.source.savePayload()?.id;

    const data: SaveSourceModel = {
      ...item,
      game_id: this.computedGame()!.id,
    };

    const request$ = sourceId
    ? this.serviceSource.update(sourceId, data)
    : this.serviceSource.create(data);

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

  protected onDeleteCharacter(item: CharacterModel): void {
    const id = item.id;

    this.handleCrudAction(
      this.characterService.delete(id),
      { loading: this.character.isSaving, successMsg: 'Personaje eliminado correctamente', errorMsg: 'Error al eliminar el Personaje', reloadOnSuccess: true }
    );
  }

  protected onSubmitCharacter(payload: { id: number, data: SaveCharacterModel, file: File | null }): void {
    const { id, data, file } = payload;

    const saveData: SaveCharacterModel = {
      ...data,
      game_id: this.computedGame()!.id,
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
