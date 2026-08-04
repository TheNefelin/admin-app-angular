import { Component, input, output } from '@angular/core';
import { AdventureModel } from '../../models/adventure-model';

@Component({
  selector: 'app-adventure-list-component',
  imports: [],
  templateUrl: './adventure-list-component.html',
})
export class AdventureListComponent {
  readonly isLoading = input<boolean>(false);
  readonly AdventureList = input<AdventureModel[]>([]);
  protected readonly onEdit = output<AdventureModel>();
  protected readonly onDelete = output<AdventureModel>();
}
