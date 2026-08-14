import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { SaveUrlModel, UrlModel } from '@features/portfolio/url/models/url-model';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { MessageErrorComponent } from '@shared/components/message-error-component/message-error-component';
import { SelectSearchComponent } from '@shared/components/select-search-component/select-search-component';
import { SelectItemModel } from '@shared/models/select-item-model';

@Component({
  selector: 'app-url-form-component',
  imports: [
    LoadingComponent,
    ButtonComponent,
    MessageErrorComponent,
    SelectSearchComponent,
  ],
  templateUrl: './url-form-component.html',
})
export class UrlFormComponent {
  readonly isLoading = input<boolean>(false);
  readonly data = input<UrlModel | null>(null);
  readonly urlgrpList = input<SelectItemModel[]>([]);

  protected readonly onClose = output<void>();
  protected readonly onSubmit = output<SaveUrlModel>();

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEditMode = computed<boolean>(() => !!this.data()?.id_url);
  protected readonly formData = linkedSignal<SaveUrlModel>(() => ({
    name: this.data()?.name ?? '',
    link: this.data()?.link ?? '',
    is_enabled: this.data()?.is_enabled ?? true,
    id_urlgrp: this.data()?.id_urlgrp ?? 0,
  }));

  protected updateName(value: string): void {
    this.formData.set({ ...this.formData(), name: value });
    this.errorMessage.set(null);
  }

  protected updateLink(value: string): void {
    this.formData.set({ ...this.formData(), link: value });
    this.errorMessage.set(null);
  }

  protected updateIsEnabled(checked: boolean): void {
    this.formData.set({ ...this.formData(), is_enabled: checked });
  }

  protected updateUrlGrp(item: SelectItemModel): void {
    this.formData.set({ ...this.formData(), id_urlgrp: item.id });
    this.errorMessage.set(null);
  }

  protected clearUrlGrp(): void {
    this.formData.set({ ...this.formData(), id_urlgrp: 0 });
  }

  protected submit(): void {
    const name = this.formData().name.trim();
    const link = this.formData().link.trim();
    const id_urlgrp = this.formData().id_urlgrp;

    if (!name || name.length > 50) {
      this.errorMessage.set('El nombre debe tener entre 1 y 50 caracteres');
      return;
    }

    if (!link) {
      this.errorMessage.set('El link es obligatorio');
      return;
    }

    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      this.errorMessage.set('El link debe ser una URL válida (http:// o https://)');
      return;
    }

    if (!id_urlgrp || id_urlgrp === 0) {
      this.errorMessage.set('Debes seleccionar un Url Grp');
      return;
    }

    this.onSubmit.emit({ ...this.formData(), name, link });
    this.errorMessage.set(null);
  }
}