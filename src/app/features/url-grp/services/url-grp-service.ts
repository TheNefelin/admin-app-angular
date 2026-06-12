import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { Observable } from 'rxjs';
import { CreateUrlGrpModel, UpdateUrlGrpModel, UrlGrpModel } from '../models/url-grp-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';

@Service()
export class UrlGrpService {
  private apiService = inject(ApiService)
  private readonly endpoint = 'url-grp';
  
  getAllPagination(params: PaginationRequestModel): Observable<PaginationResponseModel<UrlGrpModel>> {
    let path = `?page=${params.page}&limit=${params.limit}`
    
    if (params.search && params.search.trim() != '')
      path = `${path}&search=${params.search}`

    return this.apiService.getAll<PaginationResponseModel<UrlGrpModel>>(
      `${this.endpoint}/${path}`
    );
  }

  getById(id: number): Observable<UrlGrpModel | null> {
    return this.apiService.getById<UrlGrpModel | null>(
      this.endpoint, id
    );
  }

  create(item: CreateUrlGrpModel): Observable<UrlGrpModel> {
    return this.apiService.create<UrlGrpModel, CreateUrlGrpModel>(
      this.endpoint, item
    );
  }

  update(id: number, item: UpdateUrlGrpModel): Observable<UrlGrpModel> {
    return this.apiService.update<UrlGrpModel, UpdateUrlGrpModel>(
      this.endpoint, id, item
    );
  }

  delete(id: number): Observable<boolean> {
    return this.apiService.delete<boolean>(
      this.endpoint, id
    );
  }
}
