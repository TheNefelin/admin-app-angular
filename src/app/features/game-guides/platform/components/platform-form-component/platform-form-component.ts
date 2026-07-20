import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { SavePlatformModel, PlatformModel } from '@features/game-guides/platform/models/platform-model';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";

@Component({
  selector: 'app-platform-form-component',
  imports: [LoadingComponent],
  templateUrl: './platform-form-component.html',
})
export class PlatformFormComponent {
  readonly isLoading = input<boolean>(false);
  readonly data = input<PlatformModel | null>(null);

  readonly onSubmit = output<SavePlatformModel>();
  readonly onClose = output<void>();

  protected readonly isEditMode = computed(() => !!this.data());

  protected formData = linkedSignal<SavePlatformModel>(() => ({
    name: this.data()?.name ?? '',
  }));

  protected submit(): void {
    const name = this.formData().name.trim();
    if (!name) return;

    this.onSubmit.emit({ name });
  }

  protected updateName(value: string): void {
    this.formData.set({ name: value });
  }
}
