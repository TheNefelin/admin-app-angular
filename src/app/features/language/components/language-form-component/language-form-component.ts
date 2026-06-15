import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { SaveLanguageModel, LanguageModel } from '@features/language/models/language-model';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { MessageErrorComponent } from "@shared/components/message-error-component/message-error-component";
import { ImageFieldComponent } from "@shared/components/image-field-component/image-field-component";

@Component({
  selector: 'app-language-form-component',
  imports: [
    LoadingComponent,
    MessageErrorComponent,
    ImageFieldComponent
],
  templateUrl: './language-form-component.html',
})
export class LanguageFormComponent {
  readonly data = input<LanguageModel | null>(null);
  readonly isLoading = input<boolean>(false);
  readonly onSubmit = output<{ data: SaveLanguageModel; file: File | null }>();
  readonly onClose = output<void>();
  readonly onDeleteImage = output<void>();

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEditMode = computed(() => this.data() !== null);

  protected formData = linkedSignal<SaveLanguageModel>(() => {
    const item = this.data();
    return {
      name: item?.name ?? '',
    }
  });

  protected updateName(value: string): void {
    this.formData.update(d => ({ ...d, name: value }));
    this.errorMessage.set(null);
  }

  protected onFileSelected(file: File | null): void {
    this.selectedFile.set(file);
  }

  protected submit(): void {
    const name = this.formData().name.trim();

    if (!name || name.length > 50) {
      this.errorMessage.set('El nombre debe tener entre 1 y 50 caracteres');
      return;
    }

    this.onSubmit.emit({ 
      data: { 
        ...this.formData(), 
        name 
      }, 
      file: this.selectedFile() 
    });
  }
}
