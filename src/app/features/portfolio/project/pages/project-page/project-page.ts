import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { ProjectModel } from '@features/portfolio/project/models/project-model';
import { ProjectService } from '@features/portfolio/project/services/project-service';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationFilterComponent } from '@shared/components/pagination-filter-component/pagination-filter-component';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { PaginationNavComponent } from '@shared/components/pagination-nav-component/pagination-nav-component';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { Router } from '@angular/router';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { SuccessService } from '@core/services/success-service';
import { ConfirmService } from '@core/services/confirm-service';

@Component({
  selector: 'app-project-page',
  imports: [
    DatePipe,
    NgOptimizedImage,
    PaginationFilterComponent,
    ButtonComponent,
    LoadingComponent,
    PaginationNavComponent,
  ],
  templateUrl: './project-page.html',
})
export class ProjectPage {
  private readonly router = inject(Router);
  private readonly successService = inject(SuccessService);
  private readonly confirmService = inject(ConfirmService);
  protected readonly totalPages = signal<number>(1);
  protected readonly currentPage = signal<number>(1);
  private readonly limit = signal<number>(10);
  private readonly search = signal<string>('');

  private readonly service = inject(ProjectService);
  private readonly getAllPayload = computed<PaginationRequestModel>(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search()
  }));
  protected readonly computedList = computed<ProjectModel[]>(() => this.getAllRX.value() ?? []);

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
          console.error('[ProjectService::ProjectPage] getAllPagination:', err);
          return of([]);
        })
      );
    },
  });

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
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.PORTFOLIO.PROJECT.FORM]);
  }

  protected onEdit(item: ProjectModel): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.PORTFOLIO.PROJECT.FORM, item.id_project]);
  }

  protected async onDelete(item: ProjectModel): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Proyecto',
      message: `Estás seguro que deseas eliminar (${item.name})`,
    });
    if (!confirmed) return;

    this.service.delete(item.id_project).subscribe({
      next: () => {
        this.successService.show('Eliminado correctamente');
        this.getAllRX.reload();
      },
      error: (err) => {
        console.error('[ProjectService::ProjectPage] onDelete:', err);
      }
    });
  }
}