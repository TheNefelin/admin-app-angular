import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { SaveGenreModel, GenreModel } from '@features/game-guides/genre/models/genre-model';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { ButtonComponent } from "@shared/components/button-component/button-component";

@Component({
  selector: 'app-genre-form-component',
  imports: [LoadingComponent],
  templateUrl: './genre-form-component.html',
})
export class GenreFormComponent {
  readonly isLoading = input<boolean>(false);
  readonly data = input<GenreModel | null>(null);

  readonly onSubmit = output<SaveGenreModel>();
  readonly onClose = output<void>();

  protected readonly isEditMode = computed(() => !!this.data());

  protected formData = linkedSignal<SaveGenreModel>(() => ({
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
