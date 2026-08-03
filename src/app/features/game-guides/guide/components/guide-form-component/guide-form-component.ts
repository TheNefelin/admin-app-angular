import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { GuideModel, SaveGuideModel } from '../../models/guide-model';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { DatePipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-guide-form-component',
  imports: [
    JsonPipe,
    DatePipe,
    LoadingComponent, 
    ButtonComponent
  ],
  templateUrl: './guide-form-component.html',
})
export class GuideFormComponent {
  readonly isLoading = input<boolean>(false);
  readonly selectedGuide = input<GuideModel | null>(null);
  protected readonly onClose = output<void>();
  protected readonly onSubmit = output<SaveGuideModel>();

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEditMode = computed<boolean>(() => !!this.selectedGuide()?.id);
  protected readonly formData = linkedSignal<SaveGuideModel>(() => {
    const payload = this.selectedGuide();

    return {
      game_id: payload?.game_id ?? 0,
      title:  payload?.title ?? "",
      summary: payload?.summary ?? "",
      sort_order: payload?.sort_order ?? undefined,
      is_enabled: payload?.is_enabled ?? true,
    }
  });

  protected updateTitle(value: string): void {
    this.formData.update(e => ({ ...e, title: value }));
    this.errorMessage.set(null);
  }

  protected updateSummary(value: string): void {
    this.formData.update(e => ({ ...e, summary: value }));
    this.errorMessage.set(null);
  }

  protected updateSortOrder(value: string): void {
    const num = parseInt(value, 10) || 0;
    this.formData.update(e => ({ ...e, sort_order: num }));
  }

  protected updateIsEnabled(checked: boolean): void {
    this.formData.update(e => ({ ...e, is_enabled: checked }));
  }

  protected submit(): void {
    const title = this.formData().title.trim();
    if (!title || title.length > 100) {
      this.errorMessage.set('El titulo debe tener entre 1 y 100 caracteres');
      return;
    }

    const summary = this.formData().summary.trim();
    if (!summary || summary.length > 256) {
      this.errorMessage.set('La descripción debe tener entre 1 y 256 caracteres');
      return;
    }

    const data: SaveGuideModel = {
      ...this.formData(),
      title: title,
      summary: summary,
    }

    this.onSubmit.emit(data);
    this.errorMessage.set(null);
  }
}
