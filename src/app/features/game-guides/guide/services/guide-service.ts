import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { API_NAMESPACE } from '@shared/constants/routes-constant';
import { Observable } from 'rxjs';
import { GuideDetailModel, GuideModel, SaveGuideModel } from '@features/game-guides/guide/models/guide-model';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';

@Service()
export class GuideService {
  private apiService = inject(ApiService)
  private readonly namespace = API_NAMESPACE.GAME_GUIDES;
  private readonly endpoint = 'guides';

  getAllDetailByGamePagination(params: PaginationRequestModel<number>): Observable<PaginationResponseModel<GuideDetailModel>> {
    let path = `?page=${params.page}&limit=${params.limit}`

    if (params.search && params.search.trim() != '')
      path = `${path}&search=${params.search}`

    if (params.filter && params.filter > 0)
      path = `${path}&game_id=${params.filter}`

    return this.apiService.getAll<PaginationResponseModel<GuideDetailModel>>(
      this.namespace, `${this.endpoint}/detail/${path}`
    );
  }

  create(item: SaveGuideModel): Observable<GuideModel> {
    return this.apiService.create<GuideModel, SaveGuideModel>(
      this.namespace, this.endpoint, item
    );
  }

  update(id: number, item: SaveGuideModel): Observable<GuideModel> {
    return this.apiService.update<GuideModel, SaveGuideModel>(
      this.namespace, this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.namespace, this.endpoint, id
    );
  }
}
