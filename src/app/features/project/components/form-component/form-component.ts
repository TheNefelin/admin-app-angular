import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { ProjectDetailModel, SaveProjectModel } from '@features/project/models/project-model';

@Component({
  selector: 'app-form-component',
  imports: [],
  templateUrl: './form-component.html',
})
export class FormComponent {
  readonly data = input<ProjectDetailModel | null>(null);
  readonly onSubmit = output<SaveProjectModel>();
  
  protected readonly successMessage = signal<string | null>(null);
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

  protected submit(event: Event): void {
    event.preventDefault();

    const name = this.formData().name.trim();
    if (!name || name.length > 50) {
      this.errorMessage.set('El nombre debe tener entre 1 y 50 caracteres');
      return;
    }

    this.onSubmit.emit(this.formData());
  }
}
