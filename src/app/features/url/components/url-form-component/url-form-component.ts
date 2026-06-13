import { Component, computed, effect, input, output, signal } from '@angular/core';
import { CreateUrlModel, UpdateUrlModel, UrlModel } from '@features/url/models/url-model';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { SearchSelectComponent } from "@shared/components/search-select-component/search-select-component";
import { SelectItemModel } from '@shared/models/select-item-model';
import { MessageErrorComponent } from "@shared/components/message-error-component/message-error-component";

@Component({
  selector: 'app-url-form-component',
  imports: [
    LoadingComponent,
    SearchSelectComponent,
    MessageErrorComponent
  ],
  templateUrl: './url-form-component.html',
})
export class UrlFormComponent {
  readonly openFormModal = input<boolean>(false);
  readonly data = input<UrlModel | null>(null);
  readonly urlgrpList = input<SelectItemModel[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly onSubmit = output<CreateUrlModel | UpdateUrlModel>();
  readonly onClose = output<void>();

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEditMode = computed(() => this.data() !== null);
  protected readonly selectedUrlGrpId = computed(() => this.data()?.id_urlgrp);

  protected formData = signal<CreateUrlModel>({
    name: '',
    link: '',
    is_enable: true,
    id_urlgrp: 0,
  });

  private syncEffect = effect(() => {
    const isOpen = this.openFormModal();
    const item = this.data();
    if (item) {
      this.formData.set(item);
    } else if (isOpen) {
      this.formData.set({ name: '', link: '', is_enable: true, id_urlgrp: 0 });
    }
    this.errorMessage.set(null);
  });

  protected updateName(value: string): void {
    this.formData.update(d => ({ ...d, name: value }));
    this.errorMessage.set(null);
  }

  protected updateLink(value: string): void {
    this.formData.update(d => ({ ...d, link: value }));
    this.errorMessage.set(null);
  }

  protected updateIsEnable(checked: boolean): void {
    this.formData.update(d => ({ ...d, is_enable: checked }));
  }

  protected updateUrlGrp(item: SelectItemModel): void {
    this.formData.update(d => ({ ...d, id_urlgrp: item.id }));
    this.errorMessage.set(null);
  }

  protected clearUrlGrp(): void {
    this.formData.update(d => ({ ...d, id_urlgrp: 0 }));
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

    const payload = { ...this.formData(), name, link };

    if (this.isEditMode()) {
      this.onSubmit.emit({
        ...payload,
        id_url: this.data()!.id_url,
      });
    } else {
      this.onSubmit.emit(payload);
    }
  }
}
