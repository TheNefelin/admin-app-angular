import { Component, input, output } from '@angular/core';
import { LoadingComponent } from "../loading-component/loading-component";
import { NgOptimizedImage } from '@angular/common';
import { SelectedItemModel } from '@shared/models/selected-item-model';

@Component({
  selector: 'app-select-list-component',
  imports: [
    NgOptimizedImage,
    LoadingComponent
  ],
  templateUrl: './select-list-component.html',
})
export class SelectListComponent {
  readonly isLoading = input<boolean>(false);
  readonly data = input<SelectedItemModel[]>([]);
  readonly onDeleteItem = output<SelectedItemModel>();
}
