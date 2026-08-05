import { Component, input, output } from '@angular/core';
import { AdventureImageModel } from '@features/game-guides/adventure-image/models/adventure-image-model';
import { ImageViewerComponent } from "@shared/components/image-viewer-component/image-viewer-component";

@Component({
  selector: 'app-adventure-image-list-component',
  imports: [
    ImageViewerComponent
  ],
  templateUrl: './adventure-image-list-component.html',
})
export class AdventureImageListComponent {
  readonly isLoading = input<boolean>(false);
  readonly adventureImageList = input<AdventureImageModel[]>([]);
  protected readonly onDeleteAdventureImage = output<{ id: number; alt: string }>();
}
