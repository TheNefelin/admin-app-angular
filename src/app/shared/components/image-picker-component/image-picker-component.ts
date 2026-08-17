import { Component, computed, effect, input, output, signal } from '@angular/core';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';

@Component({
  selector: 'app-image-picker-component',
  imports: [
    LoadingComponent, 
    ButtonComponent,
  ],
  templateUrl: './image-picker-component.html',
})
export class ImagePickerComponent {
  readonly isLoading = input<boolean>(false)
  readonly aspectRatio = input<'aspect-square' | 'aspect-video' | null>('aspect-square');
  readonly labelText = input<string | null>(null)
  readonly displayImg = input<string | null>(null)
  readonly clearTrigger = input<number>(0);
  protected readonly selectedFile = output<File | null>();
  protected readonly deleteFile = output<void>();

  protected readonly previewImg = signal<{ file: File; dataUrl: string } | null>(null);
  protected readonly image = computed<string | null>(() =>
    this.previewImg()?.dataUrl ?? this.displayImg() ?? null
  );
  private effectClear = effect(() => {
    this.clearTrigger();
    this.clear();
  });
  
  protected handleFileSelected(file: File | null): void {
    if (!file) { this.previewImg.set(null); return; }

    const reader = new FileReader();
    reader.onload = () => this.previewImg.set({ file, dataUrl: reader.result as string });
    reader.readAsDataURL(file);

    this.selectedFile.emit(file);
  }

  protected handleDeleteFile(): void {
    if (this.previewImg()) {
      this.clear();
    } else {
      this.deleteFile.emit();
    }
  }

  private clear(): void {
    this.previewImg.set(null);
    this.selectedFile.emit(null); 
  }
}
