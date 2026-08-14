import { Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { SaveProjectModel } from '@features/portfolio/project/models/project-model';
import { ProjectService } from '@features/portfolio/project/services/project-service';
import { LoadingComponent } from '@shared/components/loading-component/loading-component';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@features/portfolio/language/services/language-service';
import { TechnologyService } from '@features/portfolio/technology/services/technology-service';
import { SelectItemModel } from '@shared/models/select-item-model';
import { ProjectFormComponent } from '@features/portfolio/project/components/project-form-component/project-form-component';
import { SuccessService } from '@core/services/success-service';

@Component({
  selector: 'app-project-form-page',
  imports: [
    LoadingComponent,
    ButtonComponent,
    ProjectFormComponent,
  ],
  templateUrl: './project-form-page.html',
})
export class ProjectFormPage {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly successService = inject(SuccessService);

  readonly routeId = toSignal(
    this.activatedRoute.paramMap.pipe(
      map(params => Number(params.get('id')) || 0)
    ),
    { initialValue: 0 }
  );

  protected readonly isLoading = computed<boolean>(() =>
    [
      this.getProjectByIdRX,
      this.getAllLanguageRX,
      this.getAllTechnologyRX,
    ].some(e => e.isLoading())
  );

  protected readonly isEditMode = computed(() => this.routeId() > 0);
  protected readonly project = {
    isSaving: signal<boolean>(false),
  };

  private readonly serviceProject = inject(ProjectService);
  private readonly getProjectByIdPayload = computed(() => this.routeId());
  protected readonly computedProject = computed(() => this.getProjectByIdRX.value() ?? null);

  private readonly serviceLanguage = inject(LanguageService);
  protected readonly computedLanguageList = computed<SelectItemModel[]>(() => {
    const items = this.getAllLanguageRX.value() ?? [];
    return items.map(e => ({ id: e.id_language, name: e.name, img_url: e.img_url }));
  });

  private readonly serviceTechnology = inject(TechnologyService);
  protected readonly computedTechnologyList = computed<SelectItemModel[]>(() => {
    const items = this.getAllTechnologyRX.value() ?? [];
    return items.map(e => ({ id: e.id_technology, name: e.name, img_url: e.img_url }));
  });

  protected readonly getProjectByIdRX = rxResource({
    params: () => this.getProjectByIdPayload(),
    stream: ({ params: id }) => {
      if (!id) return of(null);

      return this.serviceProject.getById(id).pipe(
        catchError(err => {
          console.error('[ProjectService::ProjectFormPage] getById:', err);
          return of(null);
        })
      );
    },
  });

  protected readonly getAllLanguageRX = rxResource({
    stream: () => {
      return this.serviceLanguage.getAll().pipe(
        catchError(err => {
          console.error('[LanguageService::ProjectFormPage] getAll:', err);
          return of([]);
        })
      );
    },
  });

  protected readonly getAllTechnologyRX = rxResource({
    stream: () => {
      return this.serviceTechnology.getAll().pipe(
        catchError(err => {
          console.error('[TechnologyService::ProjectFormPage] getAll:', err);
          return of([]);
        })
      );
    },
  });

  protected onDeleteImage(): void {
    const id = this.getProjectByIdPayload();
    if (!id) return;

    this.project.isSaving.set(true);

    this.serviceProject.deleteImage(id).pipe(
      finalize(() => this.project.isSaving.set(false))
    ).subscribe({
      next: () => {
        this.getProjectByIdRX.reload();
      },
      error: (err) => {
        console.error('[ProjectService::ProjectFormPage] onDeleteImage:', err);
      }
    });
  }

  protected onSubmit({ data, file }: { data: SaveProjectModel; file: File | null }): void {
    this.project.isSaving.set(true);
    const id = this.getProjectByIdPayload();

    const request$ = id
      ? this.serviceProject.update(id, data)
      : this.serviceProject.create(data);

    request$.pipe(
      switchMap(result => {
        if (file)
          return this.serviceProject.uploadImage(result.id_project, { file });

        return of(result);
      }),
      finalize(() => {
        this.getProjectByIdRX.reload();
        this.project.isSaving.set(false);
      })
    ).subscribe({
      next: (result) => {
        this.successService.show('Guardado correctamente');
        if (!id && result) {
          this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.PORTFOLIO.PROJECT.FORM, result.id_project]);
        }
      },
      error: (err) => {
        console.error('[ProjectService::ProjectFormPage] onSubmitForm:', err);
      }
    });
  }

  protected goToProject(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.PORTFOLIO.PROJECT.ROOT]);
  }
}