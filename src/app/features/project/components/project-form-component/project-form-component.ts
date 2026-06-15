import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { ProjectDetailModel, SaveProjectModel } from '@features/project/models/project-model';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { MessageErrorComponent } from "@shared/components/message-error-component/message-error-component";
import { ImageFieldComponent } from "@shared/components/image-field-component/image-field-component";

@Component({
  selector: 'app-project-form-component',
  imports: [LoadingComponent, MessageErrorComponent, ImageFieldComponent],
  templateUrl: './project-form-component.html',
})
export class ProjectFormComponent {
  readonly data = input<ProjectDetailModel | null>(null);
  readonly isLoading = input<boolean>(false);
  readonly onSubmit = output<{ data: SaveProjectModel; file: File | null }>();
  readonly onClose = output<void>();
  readonly onDeleteImage = output<void>();

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEditMode = computed(() => this.data() !== null);

  protected formData = linkedSignal<SaveProjectModel>(() => {
    const item = this.data();
    return {
      name: item?.name ?? '',
      repo_url: item?.repo_url ?? null,
      app_url: item?.app_url ?? null,
      is_enable: item?.is_enable ?? false,
    }
  });

  protected updateName(value: string): void {
    this.formData.update(d => ({ ...d, name: value }));
    this.errorMessage.set(null);
  }

  protected updateRepoUrl(value: string): void {
    this.formData.update(d => ({ ...d, repo_url: value }));
    this.errorMessage.set(null);
  }

  protected updateAppUrl(value: string): void {
    this.formData.update(d => ({ ...d, app_url: value }));
    this.errorMessage.set(null);
  }
  
  protected updateIsEnable(checked: boolean): void {
    this.formData.update(d => ({ ...d, is_enable: checked }));
  }

  protected onFileSelected(file: File | null): void {
    this.selectedFile.set(file);
  }

  protected submit(): void {
    const name = this.formData().name.trim();

    if (!name || name.length > 50) {
      this.errorMessage.set('El nombre debe tener entre 1 y 50 caracteres');
      return;
    }

    this.onSubmit.emit({
      data: { ...this.formData(), name },
      file: this.selectedFile()
    });
  }
}
