import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { SaveTechnologyModel, TechnologyModel } from '@features/portfolio/technology/models/technology-model';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';
import { ImagePickerComponent } from '@shared/components/image-picker-component/image-picker-component';

@Component({
  selector: 'app-technology-form-component',
  imports: [
    LoadingComponent,
    ButtonComponent,
    MessageErrorComponent,
    ImagePickerComponent,
  ],
  templateUrl: './technology-form-component.html',
})
export class TechnologyFormComponent {
  readonly isLoading = input<boolean>(false);
  readonly data = input<TechnologyModel | null>(null);

  protected readonly closed = output<void>();
  protected readonly submitted = output<{ data: SaveTechnologyModel; file: File | null }>();
  protected readonly deleteImage = output<void>();

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly isEditMode = computed<boolean>(() => !!this.data()?.id_technology);
  protected readonly formData = linkedSignal<SaveTechnologyModel>(() => ({
    name: this.data()?.name ?? '',
  }));

  protected updateName(value: string): void {
    this.formData.set({ name: value });
    this.errorMessage.set(null);
  }

  protected onFileSelected(file: File | null): void {
    this.selectedFile.set(file);
  }

  protected onDeleteFile(): void {
    if (this.data()?.img_url) {
      this.deleteImage.emit();
    }
    this.selectedFile.set(null);
  }

  protected submit(): void {
    const name = this.formData().name.trim();
    if (!name || name.length > 50) {
      this.errorMessage.set('El nombre debe tener entre 1 y 50 caracteres');
      return;
    }

    this.submitted.emit({
      data: { ...this.formData(), name },
      file: this.selectedFile()
    });
    this.errorMessage.set(null);
  }
}