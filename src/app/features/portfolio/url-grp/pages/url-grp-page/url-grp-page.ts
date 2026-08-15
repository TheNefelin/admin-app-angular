import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal, type WritableSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, finalize, map, of, type Observable } from 'rxjs';
import { SaveUrlGrpModel, UrlGrpModel } from '@features/portfolio/url-grp/models/url-grp-model';
import { UrlGrpService } from '@features/portfolio/url-grp/services/url-grp-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationFilterComponent } from '@shared/components/pagination-filter-component/pagination-filter-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { PaginationNavComponent } from '@shared/components/pagination-nav-component/pagination-nav-component';
import { UrlGrpFormComponent } from '@features/portfolio/url-grp/components/url-grp-form-component/url-grp-form-component';
import { SuccessService } from '@core/services/success-service';
import { ConfirmService } from '@core/services/confirm-service';

@Component({
  selector: 'app-url-grp-page',
  imports: [
    DatePipe,
    PaginationFilterComponent,
    ButtonComponent,
    LoadingComponent,
    PaginationNavComponent,
    UrlGrpFormComponent,
  ],
  templateUrl: './url-grp-page.html',
})
export class UrlGrpPage {
  private readonly successService = inject(SuccessService);
  private readonly confirmService = inject(ConfirmService);
  protected readonly showFormModal = signal<boolean>(false);
  protected readonly urlGrp = {
    savePayload: signal<UrlGrpModel | null>(null),
    isSaving: signal<boolean>(false),
  };
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  private readonly limit = signal<number>(10);
  private readonly search = signal<string>('');

  private readonly service = inject(UrlGrpService);
  private readonly getAllPayload = computed<PaginationRequestModel>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search()
  }));
  protected readonly computedList = computed<UrlGrpModel[]>(() => this.getAllRX.value() ?? []);

  protected readonly getAllRX = rxResource({
    params: () => this.getAllPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.service.getAllPagination(params).pipe(
        map(response => {
          this.totalPages.set(Math.ceil(response.total / this.limit()));
          return response.items;
        }),
        catchError(err => {
          console.error('[UrlGrpService::UrlGrpPage] getAllPagination:', err);
          return of([]);
        })
      );
    },
  });

  // MUTATION HELPER --------------------------------------------------------
  private handleMutation<T>(
    action: Observable<T>,
    state: { isSaving: WritableSignal<boolean> },
    options: {
      successMsg: string;
      errorMsg: string;
      onSuccess?: () => void;
      onFinalize?: () => void;
    },
  ): void {
    state.isSaving.set(true);
    action.pipe(
      finalize(() => {
        state.isSaving.set(false);
        options.onFinalize?.();
      })
    ).subscribe({
      next: () => {
        this.successService.show(options.successMsg);
        options.onSuccess?.();
      },
      error: (err) => {
        console.error(`[UrlGrpService::UrlGrpPage] ${options.errorMsg}:`, err);
      }
    });
  }

  // EVENTS -----------------------------------------------------------------
  protected onRefreshClick(): void {
    this.getAllRX.reload();
  }

  protected onFilterChange(filter: { search: string; limit: number }): void {
    this.search.set(filter.search);
    this.limit.set(filter.limit);
    this.currentPage.set(1);
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages()){
      this.currentPage.update(e => e + 1);
    }
  }

  protected prevPage(): void {
    if (this.currentPage() > 1){
      this.currentPage.update(e => e - 1);
    }
  }

  protected onCreate(): void {
    this.urlGrp.savePayload.set(null);
    this.showFormModal.set(true);
  }

  protected onEdit(item: UrlGrpModel): void {
    this.urlGrp.savePayload.set(item);
    this.showFormModal.set(true);
  }

  protected onCloseForm(): void {
    this.showFormModal.set(false);
    this.urlGrp.savePayload.set(null);
  }

  protected onSubmitForm(data: SaveUrlGrpModel): void {
    const id = this.urlGrp.savePayload()?.id_urlgrp;

    this.handleMutation(
      id ? this.service.update(id, data) : this.service.create(data),
      this.urlGrp,
      {
        successMsg: id ? 'Url Grp modificado correctamente' : 'Url Grp creado correctamente',
        errorMsg: id ? 'Error al modificar el Url Grp' : 'Error al crear el Url Grp',
        onSuccess: () => this.getAllRX.reload(),
        onFinalize: () => {
          this.showFormModal.set(false);
          this.urlGrp.savePayload.set(null);
        },
      }
    );
  }

  protected async onDelete(item: UrlGrpModel): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Url Grp',
      message: `Estás seguro que deseas eliminar (${item.name})`,
    });
    if (!confirmed) return;

    this.handleMutation(
      this.service.delete(item.id_urlgrp),
      this.urlGrp,
      {
        successMsg: 'Url Grp eliminado correctamente',
        errorMsg: 'Error al eliminar el Url Grp',
        onSuccess: () => this.getAllRX.reload(),
      }
    );
  }
}
