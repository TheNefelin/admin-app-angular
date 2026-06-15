import { Component, input, output } from '@angular/core';
import { ProjectDetailModel, SaveProjectModel } from '@features/project/models/project-model';

@Component({
  selector: 'app-project-form-component',
  imports: [],
  templateUrl: './project-form-component.html',
})
export class ProjectFormComponent {
  readonly data = input<ProjectDetailModel | null>(null);
  readonly isLoading = input<boolean>(false);
  readonly onSubmit = output<{ data: SaveProjectModel; file: File | null }>();
  readonly onClose = output<void>();
  readonly onDeleteImage = output<void>();
}
