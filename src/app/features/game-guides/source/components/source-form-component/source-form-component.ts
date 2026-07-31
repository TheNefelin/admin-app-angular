import { Component, input, linkedSignal, output } from '@angular/core';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { SaveSourceModel, SourceModel } from '@features/game-guides/source/models/source-model';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";

@Component({
  selector: 'app-source-form-component',
  imports: [
    ButtonComponent,
    LoadingComponent
  ],
  templateUrl: './source-form-component.html',
})
export class SourcesFormComponent {
  readonly isLoading = input<boolean>(false);
  readonly sourcePayload = input<SourceModel | null>();
  readonly clearTrigger = input<number>(0);
  protected readonly errorMessage = output<string | null>();
  protected readonly onSubmit = output<SaveSourceModel>();
  protected readonly onClear = output<void>();

  protected readonly formData = linkedSignal<SaveSourceModel>(() => {
    void this.clearTrigger();
    const item = this.sourcePayload()
    
    return {
      game_id: item?.game_id ?? 0,
      name: item?.name ?? '',
      url: item?.url ?? '',
      sort_order: item?.sort_order ?? undefined,
    }
  });

  protected updateName(value: string): void {
    this.formData.update(d => ({ ...d, name: value }));
  }

  protected updateUrl(value: string): void {
    this.formData.update(d => ({ ...d, url: value }));
  }

  protected updateSort(value: string): void {
    const num = value ? parseInt(value, 10) : 0;
    this.formData.update(d => ({ ...d, sort_order: num }));
  }

  protected clear(): void {
    this.errorMessage.emit(null);
    this.onClear.emit();
  }

  protected submit(): void {
    const name = this.formData().name.trim();
    const url = this.formData().url.trim();
    const sort = this.formData().sort_order ?? 0;

    if (!name || name.length > 200) {
      this.errorMessage.emit('[Form Fuente] - El nombre debe tener entre 1 y 200 caracteres');
      return;
    }

    if (!url || url.length > 1000) {
      this.errorMessage.emit('[Form Fuente] - El link debe tener entre 1 y 1000 caracteres');
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      this.errorMessage.emit('[Form Fuente] - El link debe ser una URL válida (http:// o https://)');
      return;
    }

    const data: SaveSourceModel = { 
      ...this.formData(), 
      name: name,
      url: url,
      sort_order: sort,
    }

    this.onSubmit.emit(data);
  }
}
