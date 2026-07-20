import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { Observable } from 'rxjs';
import { SavePlatformModel, PlatformModel } from '../models/platform-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { API_NAMESPACE } from '@shared/constants/routes-constant';

@Service()
export class PlatformService {
  private apiService = inject(ApiService)
  private readonly namespace = API_NAMESPACE.GAME_GUIDES;
  private readonly endpoint = 'platforms';

  getAllPagination(params: PaginationRequestModel): Observable<PaginationResponseModel<PlatformModel>> {
    let path = `?page=${params.page}&limit=${params.limit}`

    if (params.search && params.search.trim() != '')
      path = `${path}&search=${params.search}`

    return this.apiService.getAll<PaginationResponseModel<PlatformModel>>(
      this.namespace, `${this.endpoint}/${path}`
    );
  }

  getById(id: number): Observable<PlatformModel | null> {
    return this.apiService.getById<PlatformModel | null>(
      this.namespace, this.endpoint, id
    );
  }

  create(item: SavePlatformModel): Observable<PlatformModel> {
    return this.apiService.create<PlatformModel, SavePlatformModel>(
      this.namespace, this.endpoint, item
    );
  }

  update(id: number, item: SavePlatformModel): Observable<PlatformModel> {
    return this.apiService.update<PlatformModel, SavePlatformModel>(
      this.namespace, this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.namespace, this.endpoint, id
    );
  }
}
