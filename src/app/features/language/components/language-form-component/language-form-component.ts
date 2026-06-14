import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { SaveLanguageModel, LanguageModel } from '@features/language/models/language-model';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { MessageErrorComponent } from "@shared/components/message-error-component/message-error-component";

@Component({
  selector: 'app-language-form-component',
  imports: [
    LoadingComponent,
    MessageErrorComponent
  ],
  templateUrl: './language-form-component.html',
})
export class LanguageFormComponent {
  readonly data = input<LanguageModel | null>(null);
  readonly isLoading = input<boolean>(false);
  readonly onSubmit = output<SaveLanguageModel>();
  readonly onClose = output<void>();

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEditMode = computed(() => this.data() !== null);

  protected formData = linkedSignal<SaveLanguageModel>(() => {
    const item = this.data();
    return {
      name: item?.name ?? '',
    }
  });

  protected updateName(value: string): void {
    this.formData.update(d => ({ ...d, name: value }));
    this.errorMessage.set(null);
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
