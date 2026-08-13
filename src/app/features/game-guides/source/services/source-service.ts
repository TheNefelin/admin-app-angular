import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { API_NAMESPACE } from '@shared/constants/routes-constant';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';
import { Observable } from 'rxjs';
import { SaveSourceModel, SourceModel } from '@features/game-guides/source/models/source-model';

@Service()
export class SourceService {
  private apiService = inject(ApiService);
  private readonly namespace = API_NAMESPACE.GAME_GUIDES;
  private readonly endpoint = 'sources';

  getAllPagination(params: PaginationRequestModel): Observable<PaginationResponseModel<SourceModel>> {
    let path = `?page=${params.page}&limit=${params.limit}`;

    if (params.search && params.search.trim() != '')
      path = `${path}&search=${params.search}`;

    return this.apiService.getAll<PaginationResponseModel<SourceModel>>(
      this.namespace, `${this.endpoint}/${path}`
    );
  }

  create(item: SaveSourceModel): Observable<SourceModel> {
    return this.apiService.create<SourceModel, SaveSourceModel>(
      this.namespace, this.endpoint, item
    );
  }

  update(id: number, item: SaveSourceModel): Observable<SourceModel> {
    return this.apiService.update<SourceModel, SaveSourceModel>(
      this.namespace, this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.namespace, this.endpoint, id
    );
  }
}
