import { Component, input, output } from '@angular/core';
import { AdventureDetailModel, AdventureModel } from '@features/game-guides/adventure/models/adventure-model';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { AdventureImageListComponent } from "@features/game-guides/adventure-image/components/adventure-image-list-component/adventure-image-list-component";

@Component({
  selector: 'app-adventure-list-component',
  imports: [
    ButtonComponent,
    AdventureImageListComponent,
],
  templateUrl: './adventure-list-component.html',
})
export class AdventureListComponent {
  readonly adventureDetailList = input<AdventureDetailModel[]>([]);
  protected readonly onEditAdventureModal = output<AdventureModel>();
  protected readonly onDeleteAdventure = output<AdventureModel>();
  protected readonly onOpenAdventureImageModal = output<number>();
  protected readonly onDeleteAdventureImage = output<{ id: number; alt: string }>();
}
