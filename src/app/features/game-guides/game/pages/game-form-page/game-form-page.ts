import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { GameModel, SaveGameModel } from '@features/game-guides/game/models/game-model';
import { GameService } from '@features/game-guides/game/services/game-service';
import { GenreService } from '@features/game-guides/genre/services/genre-service';
import { PlatformService } from '@features/game-guides/platform/services/platform-service';
import { NgOptimizedImage } from '@angular/common';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectSearchComponent } from "@shared/components/select-search-component/select-search-component";
import { SelectItemModel } from '@shared/models/select-item-model';
import { MessageErrorComponent } from "@shared/components/message-error-component/message-error-component";
import { MessageSuccessComponent } from "@shared/components/message-success-component/message-success-component";
import { SelectListComponent } from "@shared/components/select-list-component/select-list-component";

@Component({
  selector: 'app-game-form-page',
  imports: [
    NgOptimizedImage,
    LoadingComponent,
    ButtonComponent,
    SelectSearchComponent,
    MessageErrorComponent,
    MessageSuccessComponent,
    SelectListComponent
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

  protected readonly clearSelectTrigger = signal<number>(0);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly isEditMode = computed(() => this.routeId() > 0);
  protected readonly displayUrl = computed<string | null>(() =>
    this.previewUrl() ?? this.computedGame()?.cover_url ?? null
  );

  protected formData = linkedSignal<SaveGameModel>(() => {
    const item = this.computedGame();

    return {
      name: item?.name ?? '',
      slug: item?.slug ?? '',
      description: item?.description ?? null,
      cover_url: item?.cover_url ?? null,
      release_year: item?.release_year ?? null,
      rating: item?.rating ?? null,
      is_enabled: item?.is_enabled ?? true,
      sort_order: item?.sort_order ?? 0,
      platform_ids: item?.platforms.map(e => e.id) ?? [],
      genre_ids: item?.genres.map(e => e.id) ?? [],
    }
  });
  protected formPlatformList = linkedSignal<SelectItemModel[]>(() => {
    const ids = this.formData().platform_ids;
    return this.computedPlatformList().filter(e => ids.includes(e.id));
  });
  protected formGenreList = linkedSignal<SelectItemModel[]>(() => {
    const ids = this.formData().genre_ids;
    return this.computedGenreList().filter(e => ids.includes(e.id));
  });

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

  protected readonly getGameByIdRX = rxResource({
    params: () => this.getGameByIdPayload(),
    stream: ({ params: id }) => {
      if (!id) return of(null);

      return this.serviceGame.getById(id).pipe(
        catchError(err => {
          console.error('[GameService::GameFormPage] getById:', err);
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
          return of([]);
        })
      );
    },
  });

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.successMessage.set(null);

    const name = this.formData().name.trim();
    if (!name || name.length > 100) {
      this.errorMessage.set('El nombre debe tener entre 1 y 100 caracteres');
      return;
    }

    const slug = this.formData().slug.trim();
    if (!slug || slug.length > 100) {
      this.errorMessage.set('El slug debe tener entre 1 y 100 caracteres');
      return;
    }

    this.isSaving.set(true);
    const data = { ...this.formData(), name, slug };
    const file = this.selectedFile();
    const id = this.getGameByIdPayload();

    const request$ = id
      ? this.serviceGame.update(id, data)
      : this.serviceGame.create(data);

    request$.pipe(
      switchMap(result => {
        if (file)
          return this.serviceGame.uploadImage(result.id, { file });

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
        } else {
          this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.GAME_GUIDE.GAME.ROOT]);
        }
      },
      error: (err) => {
        console.error('[GameService::GameFormPage] onSubmitForm:', err);
      }
    });
  }

  protected updateName(value: string): void {
    const slug = this.generateSlug(value);
    this.formData.update(d => ({ ...d, name: value, slug }));
    this.errorMessage.set(null);
  }

  private generateSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  protected updateSlug(value: string): void {
    this.formData.update(d => ({ ...d, slug: value }));
    this.errorMessage.set(null);
  }

  protected updateDescription(value: string): void {
    this.formData.update(d => ({ ...d, description: value }));
  }

  protected updateCoverUrl(value: string): void {
    this.formData.update(d => ({ ...d, cover_url: value }));
  }

  protected updateReleaseYear(value: string): void {
    const num = value ? parseInt(value, 10) : null;
    this.formData.update(d => ({ ...d, release_year: num }));
  }

  protected updateRating(value: string): void {
    const num = value ? parseInt(value, 10) : null;
    this.formData.update(d => ({ ...d, rating: num }));
  }

  protected updateSortOrder(value: string): void {
    const num = parseInt(value, 10) || 0;
    this.formData.update(d => ({ ...d, sort_order: num }));
  }

  protected updateIsEnable(checked: boolean): void {
    this.formData.update(d => ({ ...d, is_enabled: checked }));
  }

  protected updatePlatform(item: SelectItemModel): void {
    this.clearSelectTrigger.update(e => e + 1);

    this.formData.update(data => {
      const exists = data.platform_ids.some(id => id === item.id)
      if (exists) return data;

      return {
        ...data,
        platform_ids: [...data.platform_ids, item.id]
      }
    });
  }

  protected updateGenre(item: SelectItemModel): void {
    this.clearSelectTrigger.update(e => e + 1);

    this.formData.update(data => {
      const exists = data.genre_ids.some(id => id === item.id)
      if (exists) return data;

      return {
        ...data,
        genre_ids: [...data.genre_ids, item.id]
      }
    });
  }

  protected onDeletePlatform(item: SelectItemModel): void {
    this.formData.update(data => ({
      ...data,
      platform_ids: data.platform_ids.filter(id => id !== item.id)
    }));
  }

  protected onDeleteGenre(item: SelectItemModel): void {
    this.formData.update(data => ({
      ...data,
      genre_ids: data.genre_ids.filter(id => id !== item.id)
    }));
  }

  protected onDeleteImageClick(): void {
    if (this.previewUrl()) {
      this.previewUrl.set(null);
      this.selectedFile.set(null);
    } else {
      const id = this.getGameByIdPayload();
      if (!id) return;

      this.isSaving.set(true);

      this.serviceGame.deleteImage(id).pipe(
        finalize(() => this.isSaving.set(false))
      ).subscribe({
        next: () => {
          this.getGameByIdRX.reload();
        },
        error: (err) => console.error('[GameService::GameFormPage] onDeleteImage:', err)
      });
    }
  }

  protected onSelectedFile(file: File | null): void {
    if (!file) {
      this.previewUrl.set(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
    this.selectedFile.set(file);
  }

  protected goToGame(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.GAME_GUIDE.GAME.ROOT]);
  }
}
