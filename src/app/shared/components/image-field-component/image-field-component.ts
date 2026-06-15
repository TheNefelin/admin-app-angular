import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { ButtonComponent } from '../button-component/button-component';

@Component({
  selector: 'app-image-field-component',
  imports: [
    NgOptimizedImage,
    ButtonComponent
  ],
  templateUrl: './image-field-component.html',
})
export class ImageFieldComponent {
  readonly imgUrl = input<string | null>(null);
  readonly alt = input<string>('Sin Descripcion');
  readonly aspect = input<'aspect-square' | 'aspect-video'>('aspect-square');
  protected readonly fileSelected = output<File | null>();
  protected readonly onDelete = output<void>();

  protected readonly previewUrl = signal<string | null>(null);
  
  protected readonly displayUrl = computed(() =>
    this.previewUrl() ?? this.imgUrl() ?? '/images/placeholder.png'
  );

  protected onFileSelected(file: File | null): void {
    if (!file) {
      this.previewUrl.set(null);
      this.fileSelected.emit(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
    this.fileSelected.emit(file);
  }

  protected onDeleteClick(): void {
    if (this.previewUrl()) {
      this.previewUrl.set(null);
      this.fileSelected.emit(null);
    } else {
      this.onDelete.emit();
    }
  }
}
