import { Component, computed, inject, signal } from '@angular/core';
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
import { MessageErrorComponent } from "@shared/components/message-error-component/message-error-component";
import { MessageSuccessComponent } from "@shared/components/message-success-component/message-success-component";
import { ImageUploadComponent } from '@features/game-guides/game/components/image-upload-component/image-upload-component';
import { ImageListComponent } from '@features/game-guides/game/components/image-list-component/image-list-component';
import { ScreenshotService } from '@features/game-guides/screenshot/services/screenshot-service';
import { SaveScreenshotModel } from '@features/game-guides/screenshot/models/screenshot-model';
import { SaveMapModel } from '@features/game-guides/map/models/map-model';
import { MapService } from '@features/game-guides/map/services/map-service';
import { GameFormComponent } from "@features/game-guides/game/components/game-form-component/game-form-component";
import { SourcesFormComponent } from "@features/game-guides/source/components/source-form-component/source-form-component";
import { ModalErrorComponent } from "@shared/components/modal-error-component/modal-error-component";
import { SaveSourceModel } from '@features/game-guides/source/models/source-model';
import { SourceService } from '@features/game-guides/source/services/source-service';
import { SourcesListComponent } from "@features/game-guides/source/components/source-list-component/sources-list-component";

@Component({
  selector: 'app-game-form-page',
  imports: [
    LoadingComponent,
    ButtonComponent,
    MessageErrorComponent,
    MessageSuccessComponent,
    ImageUploadComponent,
    ImageListComponent,
    GameFormComponent,
    SourcesFormComponent,
    ModalErrorComponent,
    SourcesListComponent
],
  templateUrl: './game-form-page.html',
})
export class GameFormPage {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

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
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly isSavingImage = signal<boolean>(false);
  protected readonly isSavingSource = signal<boolean>(false);
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

  private readonly serviceScreenshot = inject(ScreenshotService);
  private readonly serviceMap = inject(MapService);
  private readonly serviceSource = inject(SourceService)

  protected readonly getGameByIdRX = rxResource({
    params: () => this.getGameByIdPayload(),
    stream: ({ params: id }) => {
      if (!id) return of(null);

      return this.serviceGame.getById(id).pipe(
        catchError(err => {
          console.error('[GameService::GameFormPage] getById:', err);
          this.errorMessage.set('Error al cargar el juego');
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
          this.errorMessage.set('Error al cargar plataformas');
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
          this.errorMessage.set('Error al cargar géneros');
          return of([]);
        })
      );
    },
  });

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
        this.errorMessage.set(errorMsg);
      }
    });
  }

  protected onUploadScreenshot(item: SaveScreenshotModel): void {
    this.handleImageAction(
      this.serviceScreenshot.create(item),
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
    this.handleImageAction(
      this.serviceMap.create(item),
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
        this.errorMessage.set('Error al guardar el juego');
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
        this.errorMessage.set('Error al eliminar la imagen');
      }
    });
  }

  protected onSubmitSource(item: SaveSourceModel): void {
    this.isSavingSource.set(true);

    this.serviceSource.create(item)
    .pipe(
      finalize(() => this.isSavingSource.set(false))
    )
    .subscribe({
      next: (result) => {
        this.successMessage.set('Fuente Guardada correctamente');
        this.getGameByIdRX.reload();
      },
      error: (err) => {
        console.error('[SourceService::SourceFormPage] onSubmitSource:', err);
        this.errorMessage.set('Error al guardar la Fuente');
      }
    });
  }

  protected goToGame(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.GAME_GUIDE.GAME.ROOT]);
  }

  protected clearError(): void {
    this.errorMessage.set(null)
  }
}
