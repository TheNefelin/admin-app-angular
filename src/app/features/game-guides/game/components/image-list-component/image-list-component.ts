import { Component, input, output } from '@angular/core';
import { ScreenshotModel } from '@features/game-guides/screenshot/models/screenshot-model';
import { ImageViewerComponent } from '@shared/components/image-viewer-component/image-viewer-component';

@Component({
  selector: 'app-image-list-component',
  imports: [
    ImageViewerComponent
  ],
  templateUrl: './image-list-component.html',
})
export class ImageListComponent {
  readonly imageList = input<ScreenshotModel[] | undefined>([]);
  protected readonly deleteImage = output<number>();

  protected onDeleteImageClick(id: number): void {
    this.deleteImage.emit(id);
  }
}
