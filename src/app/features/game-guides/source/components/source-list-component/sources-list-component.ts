import { Component, input } from '@angular/core';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { SourceModel } from '../../models/source-model';

@Component({
  selector: 'app-sources-list-component',
  imports: [ButtonComponent],
  templateUrl: './sources-list-component.html',
})
export class SourcesListComponent {
  readonly sourceList = input<SourceModel[]>([]);
}
