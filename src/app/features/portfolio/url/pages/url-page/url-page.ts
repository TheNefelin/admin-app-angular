import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { SaveUrlModel, FilterByUrlGrp, UrlModel, UrlModelDetail } from '@features/portfolio/url/models/url-model';
import { UrlService } from '@features/portfolio/url/services/url-service';
import { UrlGrpService } from '@features/portfolio/url-grp/services/url-grp-service';
import { CrudPage } from '@shared/base/crud-page';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { SelectItemModel } from '@shared/models/select-item-model';
import { PaginationFilterComponent } from '@shared/components/pagination-filter-component/pagination-filter-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { PaginationNavComponent } from '@shared/components/pagination-nav-component/pagination-nav-component';
import { SelectSearchComponent } from '@shared/components/select-search-component/select-search-component';
import { UrlFormComponent } from '@features/portfolio/url/components/url-form-component/url-form-component';
import { ConfirmService } from '@core/services/confirm-service';
import { MutationService } from '@core/services/mutation-service';

@Component({
  selector: 'app-url-page',
  imports: [
    DatePipe,
    PaginationFilterComponent,
    ButtonComponent,
    LoadingComponent,
    PaginationNavComponent,
    SelectSearchComponent,
    UrlFormComponent,
  ],
  templateUrl: './url-page.html',
})
export class UrlPage extends CrudPage<UrlModelDetail> {
  private readonly confirmService = inject(ConfirmService);
  private readonly mutation = inject(MutationService);
  protected readonly showFormModal = signal<boolean>(false);
  protected readonly url = {
    savePayload: signal<UrlModel | null>(null),
    isSaving: signal<boolean>(false),
  };
  private readonly selectedUrlGrpId = signal<number | null>(null);

  private readonly serviceUrlrp = inject(UrlGrpService);
  protected readonly computedUrlGrpList = computed<SelectItemModel[]>(() => {
    const items = this.getAllUrlGrpRX.value() ?? [];
    return items.map(e => ({ id: e.id_urlgrp, name: e.name, img_url: null }));
  });
  private readonly serviceUrl = inject(UrlService);
  private readonly getAllUrlPayload = computed<PaginationRequestModel<FilterByUrlGrp | null>>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search(),
    filter: this.selectedUrlGrpId() ? { id_urlgrp: this.selectedUrlGrpId()! } : null,
  }));
  protected readonly computedUrlList = computed<UrlModelDetail[]>(() => this.getAllUrlRX.value() ?? []);

  protected readonly getAllUrlGrpRX = rxResource({
    stream: () => {
      return this.serviceUrlrp.getAll().pipe(
        catchError(err => {
          console.error('[UrlGrpService::UrlPage] getAll:', err);
          return of([]);
        })
      );
    },
  });

  protected readonly getAllUrlRX = rxResource({
    params: () => this.getAllUrlPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.serviceUrl.getAllPagination(params).pipe(
        map(response => {
          this.totalPages.set(Math.ceil(response.total / this.limit()));
          return response.items;
        }),
        catchError(err => {
          console.error('[UrlService::UrlPage] getAllPagination:', err);
          return of([]);
        })
      );
    },
  });

  // EVENTS -----------------------------------------------------------------
  protected onUrlGrpChange(item: SelectItemModel): void {
    this.selectedUrlGrpId.set(item.id);
    this.currentPage.set(1);
  }

  protected onUrlGrpClear(): void {
    this.selectedUrlGrpId.set(null);
    this.currentPage.set(1);
  }

  protected override reload(): void {
    this.getAllUrlRX.reload();
    this.getAllUrlGrpRX.reload();
  }

  protected onCreate(): void {
    this.url.savePayload.set(null);
    this.showFormModal.set(true);
  }

  protected onEdit(item: UrlModel): void {
    this.url.savePayload.set(item);
    this.showFormModal.set(true);
  }

  protected onCloseForm(): void {
    this.showFormModal.set(false);
    this.url.savePayload.set(null);
  }

  protected onSubmitForm(data: SaveUrlModel): void {
    const id = this.url.savePayload()?.id_url;

    this.mutation.run(
      id ? this.serviceUrl.update(id, data) : this.serviceUrl.create(data),
      this.url,
      {
        successMsg: id ? 'Url modificada correctamente' : 'Url creada correctamente',
        errorMsg: id ? 'Error al modificar la Url' : 'Error al crear la Url',
        onSuccess: () => this.getAllUrlRX.reload(),
        onFinalize: () => {
          this.showFormModal.set(false);
          this.url.savePayload.set(null);
        },
      }
    );
  }

  protected async onDelete(item: UrlModel): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Url',
      message: `Estás seguro que deseas eliminar (${item.name})`,
    });
    if (!confirmed) return;

    this.mutation.run(
      this.serviceUrl.delete(item.id_url),
      this.url,
      {
        successMsg: 'Url eliminada correctamente',
        errorMsg: 'Error al eliminar la Url',
        onSuccess: () => this.getAllUrlRX.reload(),
      }
    );
  }
}