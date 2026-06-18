import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { SaveUrlGrpModel, UrlGrpModel } from '@features/url-grp/models/url-grp-model';
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
  readonly data = input<UrlGrpModel | null>(null);
  readonly isLoading = input<boolean>(false);
  readonly onSubmit = output<SaveUrlGrpModel>();
  readonly onClose = output<void>();

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEditMode = computed(() => this.data() !== null);

  protected formData = linkedSignal<SaveUrlGrpModel>(() => {
    const item = this.data();
    return { 
      name: item?.name ?? '', 
      is_enabled: item?.is_enabled ?? true
    }
  });

  protected updateName(value: string): void {
    this.formData.update(d => ({ ...d, name: value }));
    this.errorMessage.set(null);
  }

  protected updateIsEnable(checked: boolean): void {
    this.formData.update(d => ({ ...d, is_enabled: checked }));
  }

  protected submit(): void {
    const name = this.formData().name.trim();

    if (!name || name.length > 50) {
      this.errorMessage.set('El nombre debe tener entre 1 y 50 caracteres');
      return;
    }

    this.onSubmit.emit({ ...this.formData(), name });
  }
}
