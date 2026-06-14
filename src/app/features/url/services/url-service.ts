import { inject, Service } from '@angular/core';
import { SaveUrlModel, FilterByUrlGrp, UrlModel, UrlModelDetail } from '@features/url/models/url-model';
import { ApiService } from '@core/services/api-service';
import { Observable } from 'rxjs';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';

@Service()
export class UrlService {
  private apiService = inject(ApiService)
  private readonly endpoint = 'url';
  
  getAllPagination(params: PaginationRequestModel<FilterByUrlGrp | null>): Observable<PaginationResponseModel<UrlModelDetail>> {
    let path = `pagination?page=${params.page}&limit=${params.limit}`
    
    if (params.search && params.search.trim() != '')
      path = `${path}&search=${params.search}`

    if (params.filter)
      if (params.filter.id_urlgrp && params.filter.id_urlgrp > 0)
        path = `${path}&id_urlgrp=${params.filter.id_urlgrp}`

    return this.apiService.getAll<PaginationResponseModel<UrlModelDetail>>(
      `${this.endpoint}/${path}`
    );
  }

  getById(id: number): Observable<UrlModel | null> {
    return this.apiService.getById<UrlModel | null>(
      this.endpoint, id
    );
  }

  create(item: SaveUrlModel): Observable<UrlModel> {
    return this.apiService.create<UrlModel, SaveUrlModel>(
      this.endpoint, item
    );
  }

  update(id: number, item: SaveUrlModel): Observable<UrlModel> {
    return this.apiService.update<UrlModel, SaveUrlModel>(
      this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.endpoint, id
    );
  }
}
