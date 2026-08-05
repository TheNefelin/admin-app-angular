import { NgOptimizedImage } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ButtonComponent } from "../button-component/button-component";

@Component({
  selector: 'app-image-viewer-component',
  imports: [
    NgOptimizedImage,
    ButtonComponent
  ],
  templateUrl: './image-viewer-component.html',
})
export class ImageViewerComponent {
  readonly aspectRatio = input<'aspect-square' | 'aspect-video' | null>('aspect-square');
  readonly id = input<number>(0);
  readonly imageUrl = input<string>();
  readonly altText = input<string>("");
  protected readonly onDelete = output<{ id: number; alt: string }>();
}
