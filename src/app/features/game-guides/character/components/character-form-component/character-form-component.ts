import { Component, input, linkedSignal, output, signal } from '@angular/core';
import { ImagePickerComponent } from "@shared/components/image-picker-component/image-picker-component";
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { CharacterModel, SaveCharacterModel } from '@features/game-guides/character/models/character-model';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";

@Component({
  selector: 'app-character-form-component',
  imports: [
    ImagePickerComponent,
    ButtonComponent,
    LoadingComponent
],
  templateUrl: './character-form-component.html',
})
export class CharacterFormComponent {
  readonly isLoading = input<boolean>(false);
  readonly isEditMode = input<boolean>(false);
  readonly computedCharacter = input<CharacterModel | null>(null);
  protected readonly errorMessage = output<string | null>();
  protected readonly onDeleteImage = output<number>();
  protected readonly onSubmit = output<{ id: number, data: SaveCharacterModel; file: File | null }>();

  protected clearTrigger = signal<number>(0);
  protected selectedFile = signal<File | null>(null);
  protected formData = linkedSignal<SaveCharacterModel>(() => {
    this.clearTrigger();
    const data = this.computedCharacter();
 
    return {
      game_id: data?.game_id ?? 0,
      name: data?.name ?? '',
      slug: data?.slug ?? '',
      description: data?.description ?? '',
      image_url: data?.image_url ?? null,
      is_playable: data?.is_playable ?? true,
      sort_order: data?.sort_order ?? 0,
    }
  });

  private generateSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  protected updateName(value: string): void {
    const slug = `character-${this.generateSlug(value)}`;
    this.formData.update(d => ({ ...d, name: value, slug }));
  }

  protected updateSlug(value: string): void {
    this.formData.update(d => ({ ...d, slug: value }));
  }

  protected updateDescription(value: string): void {
    this.formData.update(d => ({ ...d, description: value }));
  }

  protected updateSortOrder(value: string): void {
    const num = parseInt(value, 10) || 0;
    this.formData.update(d => ({ ...d, sort_order: num }));
  }

  protected updateIsPlayable(checked: boolean): void {
    this.formData.update(d => ({ ...d, is_playable: checked }));
  }

  protected onSelectedFile(file: File | null): void {
    this.selectedFile.set(file);
  }

  protected onDeleteFile(): void {
    if (this.formData().image_url) {
      const id = this.computedCharacter()?.id ?? 0
      this.onDeleteImage.emit(id);
    }
    this.selectedFile.set(null);
  }

  protected submit() {
    const id = this.computedCharacter()?.id ?? 0
    const data = this.formData();
    const file = this.selectedFile();
  
    if (!data.name.trim() || data.name.trim().length > 100) {
      this.errorMessage.emit('El nombre debe tener entre 1 y 100 caracteres');
      return;
    }

    if (!data.slug.trim() || data.slug.trim().length > 100) {
      this.errorMessage.emit('El slug debe tener entre 1 y 100 caracteres');
      return;
    }

    if (!data.description.trim()) {
      this.errorMessage.emit('La descripción es obligatoria');
      return;
    }

    this.onSubmit.emit({ 
      id: id,
      data: data, 
      file: file,
    });
  }

  protected clear() {
    this.selectedFile.set(null);
    this.clearTrigger.update(e => e + 1);
    this.errorMessage.emit(null);
  }
}
