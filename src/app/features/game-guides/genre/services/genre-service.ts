import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { Observable } from 'rxjs';
import { SaveGenreModel, GenreModel } from '../models/genre-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { API_NAMESPACE } from '@shared/constants/routes-constant';

@Service()
export class GenreService {
  private apiService = inject(ApiService)
  private readonly namespace = API_NAMESPACE.GAME_GUIDES;
  private readonly endpoint = 'genres';

  getAllPagination(params: PaginationRequestModel): Observable<PaginationResponseModel<GenreModel>> {
    let path = `?page=${params.page}&limit=${params.limit}`

    if (params.search && params.search.trim() != '')
      path = `${path}&search=${params.search}`

    return this.apiService.getAll<PaginationResponseModel<GenreModel>>(
      this.namespace, `${this.endpoint}/${path}`
    );
  }

  getById(id: number): Observable<GenreModel | null> {
    return this.apiService.getById<GenreModel | null>(
      this.namespace, this.endpoint, id
    );
  }

  create(item: SaveGenreModel): Observable<GenreModel> {
    return this.apiService.create<GenreModel, SaveGenreModel>(
      this.namespace, this.endpoint, item
    );
  }

  update(id: number, item: SaveGenreModel): Observable<GenreModel> {
    return this.apiService.update<GenreModel, SaveGenreModel>(
      this.namespace, this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.namespace, this.endpoint, id
    );
  }
}
