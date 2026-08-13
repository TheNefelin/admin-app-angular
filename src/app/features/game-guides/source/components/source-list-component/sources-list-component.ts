import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { SourceModel } from '@features/game-guides/source/models/source-model';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';

@Component({
  selector: 'app-sources-list-component',
  imports: [
    ButtonComponent,
    LoadingComponent
  ],
  templateUrl: './sources-list-component.html',
})
export class SourcesListComponent {
  readonly isLoading = input<boolean>(false);
  readonly sourceList = input<SourceModel[]>([]);
  protected readonly onEdit = output<SourceModel>();
  protected readonly onDelete = output<SourceModel>();
}