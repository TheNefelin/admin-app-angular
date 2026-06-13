import { Component, computed, effect, input, output, signal } from '@angular/core';
import { UrlGrpModel, CreateUrlGrpModel, UpdateUrlGrpModel } from '@features/url-grp/models/url-grp-model';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { MessageErrorComponent } from "@shared/components/message-error-component/message-error-component";

@Component({
  selector: 'app-url-grp-form-component',
  imports: [
    LoadingComponent,
    MessageErrorComponent
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

  protected readonly errorMessage = signal<string | null>(null);

  private syncEffect = effect(() => {
    const item = this.data();
    if (item) {
      this.formData.set(item);
    } else {
      this.formData.set({ name: '', is_enable: true });
    }
    this.errorMessage.set(null);
  });

  protected updateName(value: string): void {
    this.formData.update(d => ({ ...d, name: value }));
    this.errorMessage.set(null);
  }

  protected updateIsEnable(checked: boolean): void {
    this.formData.update(d => ({ ...d, is_enable: checked }));
  }

  protected submit(): void {
    const name = this.formData().name.trim();

    if (!name || name.length > 50) {
      this.errorMessage.set('El nombre debe tener entre 1 y 50 caracteres');
      return;
    }

    const payload = { ...this.formData(), name };

    if (this.isEditMode()) {
      this.onSubmit.emit({
        ...payload,
        id_urlgrp: this.data()!.id_urlgrp,
      });
    } else {
      this.onSubmit.emit(payload);
    }
  }
}
