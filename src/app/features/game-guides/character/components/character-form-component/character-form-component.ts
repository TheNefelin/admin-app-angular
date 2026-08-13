import { Component, effect, input, linkedSignal, output, signal } from '@angular/core';
import { ImagePickerComponent } from '@shared/components/image-picker-component/image-picker-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { CharacterModel, SaveCharacterModel } from '@features/game-guides/character/models/character-model';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';

@Component({
  selector: 'app-character-form-component',
  imports: [
    ImagePickerComponent,
    ButtonComponent,
    LoadingComponent,
    MessageErrorComponent
  ],
  templateUrl: './character-form-component.html',
})
export class CharacterFormComponent {
  readonly isLoading = input<boolean>(false);
  readonly saveCharacter = input<CharacterModel | null>(null);
  readonly clearTrigger = input<number>(0);
  protected readonly onClear = output<void>();
  protected readonly onDeleteImage = output<number>();
  protected readonly onSubmit = output<{ id: number, data: SaveCharacterModel; file: File | null }>();

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly formData = linkedSignal<SaveCharacterModel>(() => {
    void this.clearTrigger();
    const data = this.saveCharacter();

    return {
      game_id: data?.game_id ?? 0,
      name: data?.name ?? '',
      slug: data?.slug ?? '',
      description: data?.description ?? '',
      image_url: data?.image_url ?? null,
      is_playable: data?.is_playable ?? true,
      sort_order: data?.sort_order ?? 0,
    };
  });

  private effectReset = effect(() => {
    void this.clearTrigger();
    this.selectedFile.set(null);
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
    this.errorMessage.set(null);
  }

  protected updateSlug(value: string): void {
    this.formData.update(d => ({ ...d, slug: value }));
    this.errorMessage.set(null);
  }

  protected updateDescription(value: string): void {
    this.formData.update(d => ({ ...d, description: value }));
    this.errorMessage.set(null);
  }

  protected updateSortOrder(value: string): void {
    const num = parseInt(value, 10) || 0;
    this.formData.update(d => ({ ...d, sort_order: num }));
    this.errorMessage.set(null);
  }

  protected updateIsPlayable(checked: boolean): void {
    this.formData.update(d => ({ ...d, is_playable: checked }));
    this.errorMessage.set(null);
  }

  protected onSelectedFile(file: File | null): void {
    this.selectedFile.set(file);
  }

  protected onDeleteFile(): void {
    if (this.formData().image_url) {
      const id = this.saveCharacter()?.id ?? 0;
      this.onDeleteImage.emit(id);
    }
    this.selectedFile.set(null);
  }

  protected submit(): void {
    const id = this.saveCharacter()?.id ?? 0;
    const data = this.formData();
    const file = this.selectedFile();

    if (!data.name.trim() || data.name.trim().length > 100) {
      this.errorMessage.set('El nombre debe tener entre 1 y 100 caracteres');
      return;
    }

    if (!data.slug.trim() || data.slug.trim().length > 100) {
      this.errorMessage.set('El slug debe tener entre 1 y 100 caracteres');
      return;
    }

    if (!data.description.trim()) {
      this.errorMessage.set('La descripción es obligatoria');
      return;
    }

    this.onSubmit.emit({
      id: id,
      data: data,
      file: file,
    });
    this.errorMessage.set(null);
  }

  protected clear(): void {
    this.errorMessage.set(null);
    this.onClear.emit();
  }
}