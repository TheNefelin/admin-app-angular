import { Component, input, output } from '@angular/core';
import { NgOptimizedImage } from "@angular/common";
import { ScreenshotModel } from '@features/game-guides/screenshot/models/screenshot-model';
import { ButtonComponent } from "@shared/components/button-component/button-component";

@Component({
  selector: 'app-image-list-component',
  imports: [
    NgOptimizedImage,
    ButtonComponent
],
  templateUrl: './image-list-component.html',
})
export class ImageListComponent {
  readonly imageList = input<ScreenshotModel[] | undefined>([])
  protected readonly onDeleteImage = output<number>();

  protected onDeleteImageClick(id: number): void {
    this.onDeleteImage.emit(id);
  }
}
