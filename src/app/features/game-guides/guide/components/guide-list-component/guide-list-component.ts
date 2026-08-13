import { Component, input, output } from '@angular/core';
import { GuideDetailModel, GuideModel } from '@features/game-guides/guide/models/guide-model';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { AdventureListComponent } from '@features/game-guides/adventure/components/adventure-list-component/adventure-list-component';
import { AdventureModel } from '@features/game-guides/adventure/models/adventure-model';

@Component({
  selector: 'app-guide-list-component',
  imports: [
    LoadingComponent,
    ButtonComponent,
    AdventureListComponent
  ],
  templateUrl: './guide-list-component.html',
})
export class GuideListComponent {
  readonly isLoading = input<boolean>(false);
  readonly guideDetailList = input<GuideDetailModel[]>([]);
  protected readonly onEditGuideModal = output<GuideModel>();
  protected readonly onDeleteGuide = output<GuideModel>();
  protected readonly onCreateAdventureModal = output<number>();
  protected readonly onEditAdventureModal = output<AdventureModel>();
  protected readonly onDeleteAdventure = output<AdventureModel>();
  protected readonly onOpenAdventureImageModal = output<number>();
  protected readonly onDeleteAdventureImage = output<{ id: number; alt: string }>();
}
