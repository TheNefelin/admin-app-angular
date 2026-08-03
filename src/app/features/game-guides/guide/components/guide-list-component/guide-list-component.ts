import { Component, input, output, signal } from '@angular/core';
import { GuideModel } from '@features/game-guides/guide/models/guide-model';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { ButtonComponent } from "@shared/components/button-component/button-component";

@Component({
  selector: 'app-guide-list-component',
  imports: [
    LoadingComponent, 
    ButtonComponent
  ],
  templateUrl: './guide-list-component.html',
})
export class GuideListComponent {
  readonly isLoading = input<boolean>(false);
  readonly computedGuideList = input<GuideModel[]>([]);
  protected readonly onEdit = output<GuideModel>();
  protected readonly onDelete = output<GuideModel>();
}
