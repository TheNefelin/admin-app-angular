import { Component, input, output } from '@angular/core';
import { LoadingComponent } from "../loading-component/loading-component";
import { NgOptimizedImage } from '@angular/common';
import { SelectItemModel } from '@shared/models/select-item-model';
import { ButtonComponent } from "../button-component/button-component";

@Component({
  selector: 'app-select-list-component',
  imports: [
    NgOptimizedImage,
    LoadingComponent,
    ButtonComponent
],
  templateUrl: './select-list-component.html',
})
export class SelectListComponent {
  readonly isLoading = input<boolean>(false);
  readonly data = input<SelectItemModel[]>([]);
  readonly onDeleteItem = output<SelectItemModel>();
}
