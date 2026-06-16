import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ProjectDetailModel, SaveProjectModel } from '@features/project/models/project-model';
import { ProjectService } from '@features/project/services/project-service';
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { ButtonComponent } from "@shared/components/button-component/button-component";
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@features/language/services/language-service';
import { TechnologyService } from '@features/technology/services/technology-service';
import { SelectSearchComponent } from "@shared/components/select-search-component/select-search-component";
import { SelectItemModel } from '@shared/models/select-item-model';
import { MessageErrorComponent } from "@shared/components/message-error-component/message-error-component";
import { MessageSuccessComponent } from "@shared/components/message-success-component/message-success-component";
import { SelectListComponent } from "@shared/components/select-list-component/select-list-component";
import { SelectedItemModel } from '@shared/models/selected-item-model';

@Component({
  selector: 'app-project-form-page',
  imports: [
    LoadingComponent,
    ButtonComponent,
    SelectSearchComponent,
    MessageErrorComponent,
    MessageSuccessComponent,
    SelectListComponent
  ],
  templateUrl: './project-form-page.html',
})
export class ProjectFormPage {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  
  readonly routeId = toSignal(
    this.activatedRoute.paramMap.pipe(
      map(params => Number(params.get('id')) || 0)
    ),
    { initialValue: 0 }
  );

  readonly isLoading = computed<boolean>(() => 
    [
      this.getProjectByIdRX,
      this.getAllLanguageRX,
      this.getAllTechnologyRX,
    ].some(e => e.isLoading())
  );

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly isEditMode = computed(() => this.routeId() > 0);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly displayUrl = computed<string | null>(() =>
    this.previewUrl() ?? this.computedProject()?.img_url ?? null
  );

  protected formData = linkedSignal<SaveProjectModel>(() => {
    const item = this.computedProject();
    
    return {
      name: item?.name ?? '',
      repo_url: item?.repo_url ?? null,
      app_url: item?.app_url ?? null,
      is_enable: item?.is_enable ?? false,
    }
  });
  protected formLanguageList = computed<SelectedItemModel[]>(() => {
    const items = this.computedProject()?.languages ?? [];
    return items.map(e => ({ id: e.id_language, name: e.name, img_url: e.img_url }));
  });
  protected formTechnologyList = computed<SelectedItemModel[]>(() => {
    const items = this.computedProject()?.technologies ?? [];
    return items.map(e => ({ id: e.id_technology, name: e.name, img_url: e.img_url }));
  });

  private readonly serviceProject = inject(ProjectService);
  private readonly getProjectByIdPayload = computed(() => this.routeId());
  protected readonly computedProject = computed<ProjectDetailModel | null>(() => this.getProjectByIdRX.value() ?? null);

  private readonly serviceLanguage = inject(LanguageService);
  protected readonly computedLanguageList = computed<SelectItemModel[]>(() => {
    const items = this.getAllLanguageRX.value() ?? []
    return items.map(e => ({ id: e.id_language, name: e.name }));
  });
  
  private readonly serviceTechnology = inject(TechnologyService);
  protected readonly computedTechnologyList = computed<SelectItemModel[]>(() => {
    const items = this.getAllTechnologyRX.value() ?? []
    return items.map(e => ({ id: e.id_technology, name: e.name }));
  });
  
  protected readonly getProjectByIdRX = rxResource({
    params: () => this.getProjectByIdPayload(),
    stream: ({ params: id }) => {
      if (!id) return of(null);

      return this.serviceProject.getById(id).pipe(
        map(result => {
          console.log(result)
          return result
        }),
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
  
  protected onDeleteImageClick(): void {
    if (this.previewUrl()) {
      this.previewUrl.set(null);
      this.selectedFile.set(null);
    } else {
      const id = this.getProjectByIdPayload();
      if (!id) return;
  
      this.isSaving.set(true);
  
      this.serviceProject.deleteImage(id).pipe(
        finalize(() => this.isSaving.set(false))
      ).subscribe({
        next: () => {
          this.getProjectByIdRX.reload();
        },
        error: (err) => console.error('[ProjectService::ProjectFormPage] onDeleteImage:', err)
      });
    }
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.successMessage.set(null);

    const name = this.formData().name.trim();
    if (!name || name.length > 50) {
      this.errorMessage.set('El nombre debe tener entre 1 y 50 caracteres');
      return;
    }

    this.isSaving.set(true);
    const data = { ...this.formData(), name };
    const file = this.selectedFile();
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
        this.isSaving.set(false)
      })
    ).subscribe({
      next: (result) => {
        this.successMessage.set('Guardado correctamente');
        if (!id && result) {
          this.router.navigate([ROUTES_CONSTANTS.PROJECT.FORM, result.id_project]);
        }    
      },
      error: (err) => {
        console.error('[ProjectService::ProjectFormPage] onSubmitForm:', err)
      }
    });
  }

  protected updateName(value: string): void {
    this.formData.update(d => ({ ...d, name: value }));
    this.errorMessage.set(null);
  }

  protected updateRepoUrl(value: string): void {
    this.formData.update(d => ({ ...d, repo_url: value }));
    this.errorMessage.set(null);
  }

  protected updateAppUrl(value: string): void {
    this.formData.update(d => ({ ...d, app_url: value }));
    this.errorMessage.set(null);
  }
  
  protected updateIsEnable(checked: boolean): void {
    this.formData.update(d => ({ ...d, is_enable: checked }));
  }

  protected onSelectedFile(file: File | null): void {
    if (!file) {
      this.previewUrl.set(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
    this.selectedFile.set(file);
  }

  protected goToProject(): void {
    this.router.navigate([ROUTES_CONSTANTS.PROJECT.ROOT]);
  }
}
