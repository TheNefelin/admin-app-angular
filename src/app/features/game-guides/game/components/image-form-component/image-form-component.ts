import { Component, input, linkedSignal, output, signal } from '@angular/core';
import { SaveScreenshotModel } from '@features/game-guides/screenshot/models/screenshot-model';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';

@Component({
  selector: 'app-image-form-component',
  imports: [
    ButtonComponent,
    LoadingComponent
  ],
  templateUrl: './image-form-component.html',
})
export class ImageFormComponent {
  readonly label = input.required<string>();
  readonly isLoading = input<boolean>(false);
  protected readonly errorMessage = output<string | null>();
  protected readonly onSubmit = output<SaveScreenshotModel>();
  protected readonly onClear = output<void>();

  protected clearTrigger = signal<number>(0);
  protected formData = linkedSignal<SaveScreenshotModel>(() => {
    this.clearTrigger();

    return {
      game_id: 0,
      alt_text: "",
      file: undefined,
    }
  });

  protected updateAlt(value: string): void {
    this.formData.update(d => ({ ...d, alt_text: value }));
  }
 
  protected onSelectedFile(file: File | null): void {
    if (!file) return;
    this.formData.update(e => ({ ...e, file: file }))
  }

  protected submit(): void {
    const data = this.formData();
    
    if (!data.alt_text || data.alt_text.length > 100) {
      this.errorMessage.emit(`[Form ${ this.label() }] - El Alt debe tener entre 1 y 100 caracteres`);
      return;
    }

    if (!data.file) {
      this.errorMessage.emit(`[Form ${ this.label() }] - No se ha seleccionado una imagen`);
      return;
    }

    this.onSubmit.emit(data);
    this.clear();
  }

  protected clear() {
    this.clearTrigger.update(e => e + 1);
  }
}
