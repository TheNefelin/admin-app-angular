import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { API_NAMESPACE } from '@shared/constants/routes-constant';
import { AdventureModel, SaveAdventureModel } from '@features/game-guides/adventure/models/adventure-model';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { Observable } from 'rxjs';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';

@Service()
export class AdventureService {
  private apiService = inject(ApiService)
  private readonly namespace = API_NAMESPACE.GAME_GUIDES;
  private readonly endpoint = 'adventures';

  getAllPagination(params: PaginationRequestModel<number>): Observable<PaginationResponseModel<AdventureModel>> {
    let path = `?page=${params.page}&limit=${params.limit}`

    if (params.search && params.search.trim() != '')
      path = `${path}&search=${params.search}`

    if (params.filter && params.filter > 0)
      path = `${path}&guide_id=${params.filter}`

    return this.apiService.getAll<PaginationResponseModel<AdventureModel>>(
      this.namespace, `${this.endpoint}/${path}`
    );
  }

  create(item: SaveAdventureModel): Observable<AdventureModel> {
    return this.apiService.create<AdventureModel, SaveAdventureModel>(
      this.namespace, this.endpoint, item
    );
  }

  update(id: number, item: SaveAdventureModel): Observable<AdventureModel> {
    return this.apiService.update<AdventureModel, SaveAdventureModel>(
      this.namespace, this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.namespace, this.endpoint, id
    );
  }
}
