import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { Observable } from 'rxjs';
import { SaveProjectModel, ProjectModel } from '@features/project/models/project-model';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';
import { UploadImageModel } from '@shared/models/upload-image-model';
import { API_NAMESPACE } from '@shared/constants/routes-constant';

@Service()
export class ProjectService {
  private apiService = inject(ApiService)
  private readonly namespace = API_NAMESPACE.PORTFOLIO;
  private readonly endpoint = 'project';

  getAllPagination(params: PaginationRequestModel): Observable<PaginationResponseModel<ProjectModel>> {
    let path = `?page=${params.page}&limit=${params.limit}`

    if (params.search && params.search.trim() != '')
      path = `${path}&search=${params.search}`

    return this.apiService.getAll<PaginationResponseModel<ProjectModel>>(
      this.namespace,
      `${this.endpoint}/pagination/${path}`
    );
  }

  getById(id: number): Observable<ProjectModel | null> {
    return this.apiService.getById<ProjectModel | null>(
      this.namespace, this.endpoint, id
    );
  }

  create(item: SaveProjectModel): Observable<ProjectModel> {
    return this.apiService.create<ProjectModel, SaveProjectModel>(
      this.namespace, this.endpoint, item
    );
  }

  update(id: number, item: SaveProjectModel): Observable<ProjectModel> {
    return this.apiService.update<ProjectModel, SaveProjectModel>(
      this.namespace, this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.namespace, this.endpoint, id
    );
  }

  uploadImage(id: number, image: UploadImageModel): Observable<ProjectModel> {
    return this.apiService.upload<ProjectModel>(
      this.namespace, this.endpoint, id, image.file
    );
  }

  deleteImage(id: number): Observable<void> {
    return this.apiService.deleteResource<void>(
      this.namespace, this.endpoint, id
    );
  }
}
