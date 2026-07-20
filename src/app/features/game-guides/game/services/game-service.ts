import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { Observable } from 'rxjs';
import { SaveGameModel, GameModel } from '../models/game-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { UploadImageModel } from '@shared/models/upload-image-model';
import { API_NAMESPACE } from '@shared/constants/routes-constant';

@Service()
export class GameService {
  private apiService = inject(ApiService)
  private readonly namespace = API_NAMESPACE.GAME_GUIDES;
  private readonly endpoint = 'games';

  getAllPagination(params: PaginationRequestModel): Observable<PaginationResponseModel<GameModel>> {
    let path = `?page=${params.page}&limit=${params.limit}`

    if (params.search && params.search.trim() != '')
      path = `${path}&search=${params.search}`

    return this.apiService.getAll<PaginationResponseModel<GameModel>>(
      this.namespace, `${this.endpoint}/${path}`
    );
  }

  getById(id: number): Observable<GameModel | null> {
    return this.apiService.getById<GameModel | null>(
      this.namespace, this.endpoint, id
    );
  }

  create(item: SaveGameModel): Observable<GameModel> {
    return this.apiService.create<GameModel, SaveGameModel>(
      this.namespace, this.endpoint, item
    );
  }

  update(id: number, item: SaveGameModel): Observable<GameModel> {
    return this.apiService.update<GameModel, SaveGameModel>(
      this.namespace, this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.namespace, this.endpoint, id
    );
  }

  uploadImage(id: number, image: UploadImageModel): Observable<GameModel> {
    return this.apiService.upload<GameModel>(
      this.namespace, this.endpoint, id, image.file
    );
  }

  deleteImage(id: number): Observable<GameModel> {
    return this.apiService.deleteResource<GameModel>(
      this.namespace, this.endpoint, id
    );
  }
}
