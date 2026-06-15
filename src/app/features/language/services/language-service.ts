import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { Observable } from 'rxjs';
import { SaveLanguageModel, LanguageModel } from '../models/language-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { UploadImageModel } from '@shared/models/upload-image-model';

@Service()
export class LanguageService {
  private apiService = inject(ApiService)
  private readonly endpoint = 'language';

  getAllPagination(params: PaginationRequestModel): Observable<PaginationResponseModel<LanguageModel>> {
    let path = `?page=${params.page}&limit=${params.limit}`

    if (params.search && params.search.trim() != '')
      path = `${path}&search=${params.search}`

    return this.apiService.getAll<PaginationResponseModel<LanguageModel>>(
      `${this.endpoint}/${path}`
    );
  }

  getById(id: number): Observable<LanguageModel | null> {
    return this.apiService.getById<LanguageModel | null>(
      this.endpoint, id
    );
  }

  create(item: SaveLanguageModel): Observable<LanguageModel> {
    return this.apiService.create<LanguageModel, SaveLanguageModel>(
      this.endpoint, item
    );
  }

  update(id: number, item: SaveLanguageModel): Observable<LanguageModel> {
    return this.apiService.update<LanguageModel, SaveLanguageModel>(
      this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.endpoint, id
    );
  }

  uploadImage(id: number, image: UploadImageModel): Observable<LanguageModel> {
    return this.apiService.upload<LanguageModel>(
      this.endpoint, id, image.file
    );
  }

  deleteImage(id: number): Observable<void> {
    return this.apiService.deleteResource<void>(
      this.endpoint, id
    );
  }  
}
