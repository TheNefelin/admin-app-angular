import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { SavePlatformModel, PlatformModel } from '@features/game-guides/platform/models/platform-model';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';

@Component({
  selector: 'app-platform-form-component',
  imports: [
    LoadingComponent,
    ButtonComponent,
    MessageErrorComponent
  ],
  templateUrl: './platform-form-component.html',
})
export class PlatformFormComponent {
  readonly isLoading = input<boolean>(false);
  readonly data = input<PlatformModel | null>(null);

  protected readonly closed = output<void>();
  protected readonly submitted = output<SavePlatformModel>();

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEditMode = computed<boolean>(() => !!this.data()?.id);
  protected readonly formData = linkedSignal<SavePlatformModel>(() => ({
    name: this.data()?.name ?? '',
  }));

  protected updateName(value: string): void {
    this.formData.set({ name: value });
    this.errorMessage.set(null);
  }

  protected submit(): void {
    const name = this.formData().name.trim();
    if (!name || name.length > 50) {
      this.errorMessage.set('El nombre debe tener entre 1 y 50 caracteres');
      return;
    }

    this.submitted.emit({ name });
    this.errorMessage.set(null);
  }
}