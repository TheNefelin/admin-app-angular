import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { SaveSourceModel, SourceModel } from '@features/game-guides/source/models/source-model';
import { DatePipe } from '@angular/common';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';

@Component({
  selector: 'app-source-form-component',
  imports: [
    DatePipe,
    LoadingComponent,
    MessageErrorComponent,
    ButtonComponent,
  ],
  templateUrl: './source-form-component.html',
})
export class SourceFormComponent {
  readonly isLoading = input<boolean>(false);
  readonly sourcePayload = input<SourceModel | null>();
  readonly clearTrigger = input<number>(0);
  protected readonly onSubmit = output<SaveSourceModel>();
  protected readonly onClose = output<void>();

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEditMode = computed<boolean>(() => !!this.sourcePayload()?.id);

  protected readonly formData = linkedSignal<SaveSourceModel>(() => {
    void this.clearTrigger();
    const item = this.sourcePayload();

    return {
      game_id: item?.game_id ?? 0,
      name: item?.name ?? '',
      url: item?.url ?? '',
      sort_order: item?.sort_order ?? undefined,
    };
  });

  protected updateName(value: string): void {
    this.formData.update(d => ({ ...d, name: value }));
    this.errorMessage.set(null);
  }

  protected updateUrl(value: string): void {
    this.formData.update(d => ({ ...d, url: value }));
    this.errorMessage.set(null);
  }

  protected updateSort(value: string): void {
    const num = value ? parseInt(value, 10) : 0;
    this.formData.update(d => ({ ...d, sort_order: num }));
    this.errorMessage.set(null);
  }

  protected submit(): void {
    const name = this.formData().name.trim();
    const url = this.formData().url.trim();
    const sort = this.formData().sort_order ?? 0;

    if (!name || name.length > 200) {
      this.errorMessage.set('El nombre debe tener entre 1 y 200 caracteres');
      return;
    }

    if (!url || url.length > 1000) {
      this.errorMessage.set('El link debe tener entre 1 y 1000 caracteres');
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      this.errorMessage.set('El link debe ser una URL válida (http:// o https://)');
      return;
    }

    const data: SaveSourceModel = {
      ...this.formData(),
      name: name,
      url: url,
      sort_order: sort,
    };

    this.onSubmit.emit(data);
    this.errorMessage.set(null);
  }
}
