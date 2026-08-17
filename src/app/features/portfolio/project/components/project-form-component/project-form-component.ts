import { Component, input, linkedSignal, output, signal } from '@angular/core';
import { ProjectModel, SaveProjectModel } from '@features/portfolio/project/models/project-model';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { SelectSearchComponent } from '@shared/components/select-search-component/select-search-component';
import { SelectItemModel } from '@shared/models/select-item-model';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';
import { SelectListComponent } from '@shared/components/select-list-component/select-list-component';
import { ImagePickerComponent } from '@shared/components/image-picker-component/image-picker-component';

@Component({
  selector: 'app-project-form-component',
  imports: [
    LoadingComponent,
    ButtonComponent,
    SelectSearchComponent,
    MessageErrorComponent,
    SelectListComponent,
    ImagePickerComponent,
  ],
  templateUrl: './project-form-component.html',
})
export class ProjectFormComponent {
  readonly isLoading = input<boolean>(false);
  readonly isSaving = input<boolean>(false);
  readonly isEditMode = input<boolean>(false);
  readonly computedProject = input<ProjectModel | null>(null);
  readonly computedLanguageList = input<SelectItemModel[]>([]);
  readonly computedTechnologyList = input<SelectItemModel[]>([]);
  protected readonly submitted = output<{ data: SaveProjectModel; file: File | null }>();
  protected readonly deleteImage = output<void>();

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly clearSelectTrigger = signal<number>(0);
  protected readonly selectedFile = signal<File | null>(null);

  protected formData = linkedSignal<SaveProjectModel>(() => {
    const item = this.computedProject();

    return {
      name: item?.name ?? '',
      repo_url: item?.repo_url ?? null,
      app_url: item?.app_url ?? null,
      is_enabled: item?.is_enabled ?? false,
      language_ids: item?.languages.map(e => e.id_language) ?? [],
      technology_ids: item?.technologies.map(e => e.id_technology) ?? []
    }
  });
  protected formLanguageList = linkedSignal<SelectItemModel[]>(() => {
    const ids = this.formData().language_ids;
    return this.computedLanguageList().filter(e => ids.includes(e.id));
  });
  protected formTechnologyList = linkedSignal<SelectItemModel[]>(() => {
    const ids = this.formData().technology_ids;
    return this.computedTechnologyList().filter(e => ids.includes(e.id));
  });

  protected onDeleteImageClick(): void {
    if (this.computedProject()?.img_url) {
      this.deleteImage.emit();
    }
    this.selectedFile.set(null);
  }

  protected onDeleteLanguage(item: SelectItemModel): void {
    this.formData.update(data => ({
      ...data,
      language_ids: data.language_ids.filter(id => id !== item.id)
    }));
  }

  protected onDeleteTechnology(item: SelectItemModel): void {
    this.formData.update(data => ({
      ...data,
      technology_ids: data.technology_ids.filter(id => id !== item.id)
    }));
  }

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
    this.formData.update(d => ({ ...d, is_enabled: checked }));
  }

  protected updateLanguage(item: SelectItemModel): void {
    this.clearSelectTrigger.update(e => e + 1);

    this.formData.update(data => {
      const exists = data.language_ids.some(id => id === item.id)
      if (exists) return data;

      return {
        ...data,
        language_ids: [...data.language_ids, item.id]
      }
    });
  }

  protected updateTechnology(item: SelectItemModel): void {
    this.clearSelectTrigger.update(e => e + 1);

    this.formData.update(data => {
      const exists = data.technology_ids.some(id => id === item.id)
      if (exists) return data;

      return {
        ...data,
        technology_ids: [...data.technology_ids, item.id]
      }
    });
  }

  protected onSelectedFile(file: File | null): void {
    this.selectedFile.set(file);
  }

  protected submit(): void {
    const name = this.formData().name.trim();
    if (!name || name.length > 50) {
      this.errorMessage.set('El nombre debe tener entre 1 y 50 caracteres');
      return;
    }

    this.submitted.emit({
      data: { ...this.formData(), name },
      file: this.selectedFile()
    });
    this.errorMessage.set(null);
  }
}