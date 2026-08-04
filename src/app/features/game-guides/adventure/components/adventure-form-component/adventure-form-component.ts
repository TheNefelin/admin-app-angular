import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { AdventureModel, SaveAdventureModel } from '@features/game-guides/adventure/models/adventure-model';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { MessageErrorComponent } from "@shared/components/message-error-component/message-error-component";
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-adventure-form-component',
  imports: [
    DatePipe,
    ButtonComponent,
    LoadingComponent,
    MessageErrorComponent
],
  templateUrl: './adventure-form-component.html',
})
export class AdventureFormComponent {
  readonly isLoading = input<boolean>(false);
  readonly selecteAdventure = input<AdventureModel | null>(null);
  protected readonly onClose = output<void>();
  protected readonly onSubmit = output<SaveAdventureModel>();

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEditMode = computed<boolean>(() => !!this.selecteAdventure()?.id);
  protected readonly formData = linkedSignal<SaveAdventureModel>(() => {
    const payload = this.selecteAdventure();

    return {
      guide_id: payload?.guide_id ?? 0,
      description: payload?.description ?? "",
      sort_order: payload?.sort_order ?? undefined,
      is_important: payload?.is_important ?? false,
      is_optional: payload?.is_optional ?? false,
    }
  });

  protected updateDescription(value: string): void {
    this.formData.update(e => ({ ...e, description: value }));
    this.errorMessage.set(null);
  }

  protected updateSortOrder(value: string): void {
    const num = parseInt(value, 10) || 0;
    this.formData.update(e => ({ ...e, sort_order: num }));
  }

  protected updateIsImportant(checked: boolean): void {
    this.formData.update(e => ({ ...e, is_important: checked }));
  }

  protected updateIsOptional(checked: boolean): void {
    this.formData.update(e => ({ ...e, is_optional: checked }));
  }

  protected submit(): void {
    const description = this.formData().description.trim();
    if (description && description.length > 256) {
      this.errorMessage.set('La descripción no puede superar 256 caracteres');
      return;
    }

    const data: SaveAdventureModel = {
      ...this.formData(),
      description: description,
    }

    this.onSubmit.emit(data);
    this.errorMessage.set(null);
  }
}
