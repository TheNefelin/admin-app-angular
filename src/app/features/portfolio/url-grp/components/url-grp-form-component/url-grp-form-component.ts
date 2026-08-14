import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { SaveUrlGrpModel, UrlGrpModel } from '@features/portfolio/url-grp/models/url-grp-model';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';

@Component({
  selector: 'app-url-grp-form-component',
  imports: [
    LoadingComponent,
    ButtonComponent,
    MessageErrorComponent
  ],
  templateUrl: './url-grp-form-component.html',
})
export class UrlGrpFormComponent {
  readonly isLoading = input<boolean>(false);
  readonly data = input<UrlGrpModel | null>(null);

  protected readonly onClose = output<void>();
  protected readonly onSubmit = output<SaveUrlGrpModel>();

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEditMode = computed<boolean>(() => !!this.data()?.id_urlgrp);
  protected readonly formData = linkedSignal<SaveUrlGrpModel>(() => ({
    name: this.data()?.name ?? '',
    is_enabled: this.data()?.is_enabled ?? true,
  }));

  protected updateName(value: string): void {
    this.formData.set({ ...this.formData(), name: value });
    this.errorMessage.set(null);
  }

  protected updateIsEnabled(checked: boolean): void {
    this.formData.set({ ...this.formData(), is_enabled: checked });
  }

  protected submit(): void {
    const name = this.formData().name.trim();
    if (!name || name.length > 50) {
      this.errorMessage.set('El nombre debe tener entre 1 y 50 caracteres');
      return;
    }

    this.onSubmit.emit({ ...this.formData(), name });
    this.errorMessage.set(null);
  }
}