import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { Observable } from 'rxjs';
import { SaveProjectModel, ProjectDetailModel } from '@features/project/models/project-model';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';
import { UploadImageModel } from '@shared/models/upload-image-model';

@Service()
export class ProjectService {
  private apiService = inject(ApiService)
  private readonly endpoint = 'project';

  getAllPagination(params: PaginationRequestModel): Observable<PaginationResponseModel<ProjectDetailModel>> {
    let path = `?page=${params.page}&limit=${params.limit}`

    if (params.search && params.search.trim() != '')
      path = `${path}&search=${params.search}`

    return this.apiService.getAll<PaginationResponseModel<ProjectDetailModel>>(
      `${this.endpoint}/pagination/${path}`
    );
  }

  getById(id: number): Observable<ProjectDetailModel | null> {
    return this.apiService.getById<ProjectDetailModel | null>(
      this.endpoint, id
    );
  }

  create(item: SaveProjectModel): Observable<ProjectDetailModel> {
    return this.apiService.create<ProjectDetailModel, SaveProjectModel>(
      this.endpoint, item
    );
  }

  update(id: number, item: SaveProjectModel): Observable<ProjectDetailModel> {
    return this.apiService.update<ProjectDetailModel, SaveProjectModel>(
      this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.endpoint, id
    );
  }

  uploadImage(id: number, image: UploadImageModel): Observable<ProjectDetailModel> {
    return this.apiService.upload<ProjectDetailModel>(
      this.endpoint, id, image.file
    );
  }

  deleteImage(id: number): Observable<void> {
    return this.apiService.deleteResource<void>(
      this.endpoint, id
    );
  }
}
