import { Component, input, linkedSignal, output, signal } from '@angular/core';
import { SaveScreenshotModel } from '@features/game-guides/screenshot/models/screenshot-model';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';

@Component({
  selector: 'app-image-form-component',
  imports: [
    ButtonComponent,
    LoadingComponent,
    MessageErrorComponent,
  ],
  templateUrl: './image-form-component.html',
})
export class ImageFormComponent {
  readonly label = input.required<string>();
  readonly isLoading = input<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly onSubmit = output<SaveScreenshotModel>();

  protected clearTrigger = signal<number>(0);
  protected formData = linkedSignal<SaveScreenshotModel>(() => {
    void this.clearTrigger();

    return {
      game_id: 0,
      alt_text: '',
      sort_order: undefined,
      file: undefined,
    };
  });

  protected updateAlt(value: string): void {
    this.formData.update(d => ({ ...d, alt_text: value }));
    this.errorMessage.set(null);
  }

  protected updateSortOrder(value: string): void {
    const num = parseInt(value, 10) || 0;
    this.formData.update(d => ({ ...d, sort_order: num }));
    this.errorMessage.set(null);
  }

  protected onSelectedFile(file: File | null): void {
    if (!file) return;
    this.formData.update(e => ({ ...e, file }));
    this.errorMessage.set(null);
  }

  protected submit(): void {
    const data = this.formData();

    if (!data.alt_text || data.alt_text.length > 200) {
      this.errorMessage.set('El Alt debe tener entre 1 y 200 caracteres');
      return;
    }

    if (!data.file) {
      this.errorMessage.set('Debes seleccionar una imagen');
      return;
    }

    this.onSubmit.emit(data);
    this.clear();
  }

  protected clear(): void {
    this.errorMessage.set(null);
    this.clearTrigger.update(e => e + 1);
  }
}