import { Component, computed, effect, input, output, signal } from '@angular/core';
import { UrlGrpModel, CreateUrlGrpModel, UpdateUrlGrpModel } from '@features/url-grp/models/url-grp-model';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";

@Component({
  selector: 'app-url-grp-form-component',
  imports: [
    LoadingComponent
  ],
  templateUrl: './url-grp-form-component.html',
})
export class UrlGrpFormComponent {
  readonly openFormModal = input<boolean>(false);
  readonly data = input<UrlGrpModel | null>(null);
  readonly isLoading = input<boolean>(false);
  readonly onSubmit = output<CreateUrlGrpModel | UpdateUrlGrpModel>();
  readonly onClose = output<void>();

  protected readonly isEditMode = computed(() => this.data() !== null);

  protected formData = signal<CreateUrlGrpModel>({
    name: '',
    is_enable: true,
  });

  private syncEffect = effect(() => {
    const item = this.data();
    if (item) {
      this.formData.set(item);
    } else {
      this.formData.set({ name: '', is_enable: true });
    }
  });

  protected updateName(value: string): void {
    this.formData.update(d => ({ ...d, name: value }));
  }

  protected updateIsEnable(checked: boolean): void {
    this.formData.update(d => ({ ...d, is_enable: checked }));
  }

  protected submit(): void {
    const data = this.formData();
    if (!data.name.trim()) return;

    if (this.isEditMode()) {
      this.onSubmit.emit({
        ...data,
        id_urlgrp: this.data()!.id_urlgrp,
      });
    } else {
      this.onSubmit.emit(data);
    }
  }
}
