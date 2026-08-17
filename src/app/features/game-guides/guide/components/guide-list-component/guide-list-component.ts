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
  protected readonly editGuideModal = output<GuideModel>();
  protected readonly deleteGuide = output<GuideModel>();
  protected readonly createAdventureModal = output<number>();
  protected readonly editAdventureModal = output<AdventureModel>();
  protected readonly deleteAdventure = output<AdventureModel>();
  protected readonly openAdventureImageModal = output<number>();
  protected readonly deleteAdventureImage = output<{ id: number; alt: string }>();
}
