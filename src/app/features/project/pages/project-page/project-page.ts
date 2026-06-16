import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProjectDetailModel } from '@features/project/models/project-model';
import { ProjectService } from '@features/project/services/project-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { catchError, finalize, map, of } from 'rxjs';
import { PaginationFilterComponent } from "@shared/components/pagination-filter-component/pagination-filter-component";
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { MessageSuccessComponent } from "@shared/components/message-success-component/message-success-component";
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { PaginationNavComponent } from "@shared/components/pagination-nav-component/pagination-nav-component";
import { ModalActionComponent } from "@shared/components/modal-action-component/modal-action-component";
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-page',
  imports: [
    DatePipe,
    NgOptimizedImage,
    PaginationFilterComponent,
    ButtonComponent,
    MessageSuccessComponent,
    LoadingComponent,
    PaginationNavComponent,
    ModalActionComponent,
  ],
  templateUrl: './project-page.html',
})
export class ProjectPage {
  private readonly router = inject(Router);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly deleteModalMessage = signal<string>('');
  protected readonly showDeleteModal = signal<boolean>(false);
  protected readonly isDeleting = signal<boolean>(false);
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  private readonly limit = signal<number>(5);
  private readonly search = signal<string>('');

  private readonly service = inject(ProjectService);
  private readonly getAllPayload = computed<PaginationRequestModel>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search()
  }));
  protected readonly deleteItemId = signal<number | null>(null);
  protected readonly computedList = computed<ProjectDetailModel[]>(() => this.getAllRX.value() ?? []);

  protected readonly getAllRX = rxResource({
    params: () => this.getAllPayload(),
    stream: ({ params }) => {
      if (!params) return of(null);

      return this.service.getAllPagination(params).pipe(
        map(response => {
          this.totalPages.set(response.pages);
          return response.data;
        }),
        catchError(err => {
          console.error('[ProjectService::ProjectPage] getAllPagination:', err);
          return of([]);
        })
      );
    },
  });

  protected onRefreshClick(): void {
    this.getAllRX.reload();
    this.successMessage.set(null);
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
    this.router.navigate([ROUTES_CONSTANTS.PROJECT.FORM]);
  }

  protected onEdit(item: ProjectDetailModel): void {
    this.router.navigate([ROUTES_CONSTANTS.PROJECT.FORM, item.id_project]);
  }

  protected onDelete(item: ProjectDetailModel): void {
    this.deleteModalMessage.set(`Estas seguro que deceas eliminar (${item.name})`);
    this.deleteItemId.set(item.id_project);
    this.showDeleteModal.set(true);
  }

  protected onDeleteModalConfirm(): void {
    this.isDeleting.set(true);

    const id = this.deleteItemId();
    if (!id) return;

    this.service.delete(id).pipe(
      finalize(() => this.isDeleting.set(false))
    ).subscribe({
      next: () => {
        this.successMessage.set('Eliminado correctamente');
        this.showDeleteModal.set(false);
        this.getAllRX.reload();
      },
      error: (err) => {
        console.error('[ProjectService::ProjectPage] onDelete:', err);
      }
    });
  }
}
