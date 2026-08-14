import { Component, input, output, signal } from '@angular/core';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { SaveScreenshotModel } from '@features/game-guides/screenshot/models/screenshot-model';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { ImagePickerComponent } from '@shared/components/image-picker-component/image-picker-component';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';

@Component({
  selector: 'app-screenshot-form-component',
  imports: [
    LoadingComponent,
    ButtonComponent,
    ImagePickerComponent,
    MessageErrorComponent,
  ],
  templateUrl: './screenshot-form-component.html',
})
export class ScreenshotFormComponent {
  readonly isLoading = input<boolean>(false);
  protected readonly onClose = output<void>();
  protected readonly onSubmit = output<SaveScreenshotModel>();

  protected readonly errorMessage = signal<string | null>(null);

  protected readonly formData = signal<SaveScreenshotModel>({
    game_id: 0,
    alt_text: '',
    sort_order: undefined,
    file: undefined,
  });

  protected updateAlt(value: string): void {
    this.formData.update(d => ({ ...d, alt_text: value }));
    this.errorMessage.set(null);
  }

  protected updateSort(value: string): void {
    const num = parseInt(value, 10) || 0;
    this.formData.update(d => ({ ...d, sort_order: num }));
    this.errorMessage.set(null);
  }

  protected onSelectedFile(file: File | null): void {
    this.formData.update(d => ({ ...d, file: file ?? undefined }));
    this.errorMessage.set(null);
  }

  protected submit(): void {
    const alt = this.formData().alt_text?.trim() ?? '';
    if (!alt || alt.length > 200) {
      this.errorMessage.set('El Alt debe tener entre 1 y 200 caracteres');
      return;
    }

    const sort = this.formData().sort_order ?? 0;
    if (sort < 0) {
      this.errorMessage.set('El Sort no puede ser negativo');
      return;
    }

    if (!this.formData().file) {
      this.errorMessage.set('Debes seleccionar una imagen');
      return;
    }

    const data: SaveScreenshotModel = {
      ...this.formData(),
      alt_text: alt,
      sort_order: sort,
    };

    this.onSubmit.emit(data);
    this.errorMessage.set(null);
  }
}
