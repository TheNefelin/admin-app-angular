import { Component, input, linkedSignal, output, signal } from '@angular/core';
import { SaveScreenshotModel } from '@features/game-guides/screenshot/models/screenshot-model';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { LoadingComponent } from "@shared/components/loading-component/loading-component";

@Component({
  selector: 'app-image-upload-component',
  imports: [
    ButtonComponent,
    LoadingComponent
],
  templateUrl: './image-upload-component.html',
})
export class ImageUploadComponent {
  readonly isLoading = input<boolean>(false);
  readonly gameId = input.required<number>();
  readonly label = input.required<string>();
  protected readonly onSubmit = output<SaveScreenshotModel>();

  protected formData = linkedSignal<SaveScreenshotModel>(() => {
    return {
      game_id: this.gameId(),
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
    if (this.gameId() <= 0 || !data.file) return;
    this.onSubmit.emit(data);
    this.formData.update(e => ({ ...e, alt_text: '', file: undefined }))
  }
}

