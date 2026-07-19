import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { Observable } from 'rxjs';
import { SaveUrlGrpModel, UrlGrpModel } from '../models/url-grp-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { API_NAMESPACE } from '@shared/constants/routes-constant';

@Service()
export class UrlGrpService {
  private apiService = inject(ApiService)
  private readonly namespace = API_NAMESPACE.PORTFOLIO;
  private readonly endpoint = 'url-grp';
  
  getAllPagination(params: PaginationRequestModel): Observable<PaginationResponseModel<UrlGrpModel>> {
    let path = `?page=${params.page}&limit=${params.limit}`
    
    if (params.search && params.search.trim() != '')
      path = `${path}&search=${params.search}`

    return this.apiService.getAll<PaginationResponseModel<UrlGrpModel>>(
      this.namespace,
      `${this.endpoint}/pagination/${path}`
    );
  }

  getAll(): Observable<UrlGrpModel[]> {
    return this.apiService.getAll<UrlGrpModel[]>(this.namespace, this.endpoint);
  }

  getById(id: number): Observable<UrlGrpModel | null> {
    return this.apiService.getById<UrlGrpModel | null>(
      this.namespace, this.endpoint, id
    );
  }

  create(item: SaveUrlGrpModel): Observable<UrlGrpModel> {
    return this.apiService.create<UrlGrpModel, SaveUrlGrpModel>(
      this.namespace, this.endpoint, item
    );
  }

  update(id: number, item: SaveUrlGrpModel): Observable<UrlGrpModel> {
    return this.apiService.update<UrlGrpModel, SaveUrlGrpModel>(
      this.namespace, this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.namespace, this.endpoint, id
    );
  }
}
