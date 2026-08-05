import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { AdventureImageModel, SaveAdventureImageModel } from '../../models/adventure-image-model';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { ImagePickerComponent } from "@shared/components/image-picker-component/image-picker-component";
import { MessageErrorComponent } from "@shared/components/message-error-component/message-error-component";

@Component({
  selector: 'app-adventure-image-form-component',
  imports: [
    LoadingComponent,
    ButtonComponent,
    ImagePickerComponent,
    MessageErrorComponent
  ],
  templateUrl: './adventure-image-form-component.html',
})
export class AdventureImageFormComponent {
  readonly isLoading = input<boolean>(false);
  readonly selectedAdventureImage = input<AdventureImageModel | null>(null);
  readonly clearTrigger = input<number>(0);
  protected readonly onClose = output<void>();
  protected readonly onSubmit = output<SaveAdventureImageModel>();

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEditMode = computed<boolean>(() => !!this.selectedAdventureImage()?.id);

  protected formData = linkedSignal<SaveAdventureImageModel>(() => {
    void this.clearTrigger();
    const data = this.selectedAdventureImage();
 
    return {
      adventure_id: data?.adventure_id ?? 0,
      alt_text: data?.alt_text ?? "",
      sort_order: data?.sort_order ?? 0,
      file: null,
    }
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
    this.formData.update(d => ({ ...d, file: file }));
  }
  
  protected submit(): void {
    const alt = this.formData().alt_text.trim();
    if (!alt || alt.length > 100) {
      this.errorMessage.set('Alt debe tener entre 1 y 100 caracteres');
      return;
    }

    const sort = this.formData().sort_order ?? 0;
    if (sort < 0) {
      this.errorMessage.set('Sort no puede ser negativo');
      return;
    }

    const data: SaveAdventureImageModel = {
      ...this.formData(),
      alt_text: alt,
      sort_order: sort,
    }

    this.onSubmit.emit(data);
    this.errorMessage.set(null);
  }
}
