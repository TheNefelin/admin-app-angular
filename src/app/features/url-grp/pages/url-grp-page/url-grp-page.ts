import { DatePipe, JsonPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { UrlGrpService } from '@features/url-grp/services/url-grp-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { catchError, map, of } from 'rxjs';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { UrlGrpModel } from '@features/url-grp/models/url-grp-model';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { ModalActionComponent } from "@shared/components/modal-action-component/modal-action-component";

@Component({
  selector: 'app-url-grp-page',
  imports: [
    DatePipe,
    LoadingComponent,
    ButtonComponent,
    ModalActionComponent
  ],
  templateUrl: './url-grp-page.html',
})
export class UrlGrpPage {
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showModal = signal<boolean>(false);
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  private readonly limit = signal<number>(10);
  private readonly search = signal<string>('');

  protected readonly isLoading = computed<boolean>(() => this.geAlltUrlGrpRX.isLoading());

  private readonly serviceUrlGrp = inject(UrlGrpService);
  private readonly getAllUrlGrpPayload = computed<PaginationRequestModel>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search()
  }));
  protected readonly computedUrlGrp = computed<UrlGrpModel[]>(() => this.geAlltUrlGrpRX.value() ?? []);

  protected readonly geAlltUrlGrpRX = rxResource({
    params: () => this.getAllUrlGrpPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.serviceUrlGrp.getAllPagination(params).pipe(
        map(response => {
          this.totalPages.set(response.pages);
          return response.data;
        }),
        catchError(err => {
          this.errorMessage.set(`[UrlGrpService] Error fetching: ${err}`);
          console.error('[UrlGrpService] Error fetching:', err);
          return of([]);
        })
      );
    },
  });

  protected onSearch(): void {
    this.geAlltUrlGrpRX.reload();
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

  protected onEdit(item: UrlGrpModel): void {

  }

  protected onDelete(tem: UrlGrpModel): void {
    this.showModal.set(true);
  }

  protected onModalConfirm(): void {
    this.showModal.set(false);
  }
}
