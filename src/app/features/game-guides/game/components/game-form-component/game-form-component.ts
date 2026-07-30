import { Component, input, linkedSignal, output, signal } from '@angular/core';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { SelectListComponent } from "@shared/components/select-list-component/select-list-component";
import { SelectSearchComponent } from "@shared/components/select-search-component/select-search-component";
import { ImagePickerComponent } from "@shared/components/image-picker-component/image-picker-component";
import { GameModel, SaveGameModel } from '@features/game-guides/game/models/game-model';
import { SelectItemModel } from '@shared/models/select-item-model';

@Component({
  selector: 'app-game-form-component',
  imports: [
    LoadingComponent,
    ButtonComponent,
    SelectListComponent,
    SelectSearchComponent,
    ImagePickerComponent
],
  templateUrl: './game-form-component.html',
})
export class GameFormComponent {
  readonly isLoading = input<boolean>(false);
  readonly isSaving = input<boolean>(false);
  readonly isEditMode = input<boolean | null>(null);
  readonly computedGame = input<GameModel | null>(null);
  readonly computedPlatformList = input<SelectItemModel[]>([]);
  readonly computedGenreList = input<SelectItemModel[]>([]);
  protected readonly errorMessage = output<string | null>();
  protected readonly onDeleteImage = output<void>();
  protected readonly onSubmit = output<{ data: SaveGameModel; file: File | null }>();

  protected readonly clearSelectTrigger = signal<number>(0);
  protected selectedFile: File | null = null;

  protected formData = linkedSignal<SaveGameModel>(() => {
    const data = this.computedGame();
 
    return {
      name: data?.name ?? '',
      slug: data?.slug ?? '',
      description: data?.description ?? null,
      cover_url: data?.cover_url ?? null,
      release_year: data?.release_year ?? null,
      rating: data?.rating ?? null,
      is_enabled: data?.is_enabled ?? true,
      sort_order: data?.sort_order ?? 0,
      platform_ids: data?.platforms.map(e => e.id) ?? [],
      genre_ids: data?.genres.map(e => e.id) ?? [],
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
  
  protected updateName(value: string): void {
    const slug = this.generateSlug(value);
    this.formData.update(d => ({ ...d, name: value, slug }));
    this.errorMessage.emit(null);
  }

  private generateSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  protected updateSlug(value: string): void {
    this.formData.update(d => ({ ...d, slug: value }));
    this.errorMessage.emit(null);
  }

  protected updateDescription(value: string): void {
    this.formData.update(d => ({ ...d, description: value }));
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

  protected onUpdatePlatform(item: SelectItemModel): void {
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

  protected onDeletePlatform(item: SelectItemModel): void {
    this.formData.update(data => ({
      ...data,
      platform_ids: data.platform_ids.filter(id => id !== item.id)
    }));
  }

  protected onUpdateGenre(item: SelectItemModel): void {
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

  protected onDeleteGenre(item: SelectItemModel): void {
    this.formData.update(data => ({
      ...data,
      genre_ids: data.genre_ids.filter(id => id !== item.id)
    }));
  }

  protected onSelectedFile(file: File | null): void {
    this.selectedFile = file;
  }

  protected submit(): void {
    const name = this.formData().name.trim();
    if (!name || name.length > 100) {
      this.errorMessage.emit('El nombre debe tener entre 1 y 100 caracteres');
      return;
    }

    const slug = this.formData().slug.trim();
    if (!slug || slug.length > 100) {
      this.errorMessage.emit('El slug debe tener entre 1 y 100 caracteres');
      return;
    }

    this.onSubmit.emit({ 
      data: this.formData(), 
      file: this.selectedFile 
    });
    
    this.selectedFile = null;
    this.errorMessage.emit(null);
  }
}
