import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { API_NAMESPACE } from '@shared/constants/routes-constant';
import { PaginationRequestModel } from '@shared/models/pagination-request-model';
import { PaginationResponseModel } from '@shared/models/pagination-response-model';
import { Observable } from 'rxjs';
import { CharacterModel, SaveCharacterModel } from '@features/game-guides/character/models/character-model';

@Service()
export class CharacterService {
  private apiService = inject(ApiService);
  private readonly namespace = API_NAMESPACE.GAME_GUIDES;
  private readonly endpoint = 'characters';

  getAllPagination(params: PaginationRequestModel): Observable<PaginationResponseModel<CharacterModel>> {
    let path = `?page=${params.page}&limit=${params.limit}`;

    if (params.search && params.search.trim() != '')
      path = `${path}&search=${params.search}`;

    return this.apiService.getAll<PaginationResponseModel<CharacterModel>>(
      this.namespace, `${this.endpoint}/${path}`
    );
  }

  create(item: SaveCharacterModel): Observable<CharacterModel> {
    return this.apiService.create<CharacterModel, SaveCharacterModel>(
      this.namespace, this.endpoint, item
    );
  }

  update(id: number, item: SaveCharacterModel): Observable<CharacterModel> {
    return this.apiService.update<CharacterModel, SaveCharacterModel>(
      this.namespace, this.endpoint, id, item
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(
      this.namespace, this.endpoint, id
    );
  }

  uploadImage(id: number, file: File): Observable<CharacterModel> {
    const fields: Record<string, string> = { id: id.toString() };
    return this.apiService.postWithFile<CharacterModel>(this.namespace, `${this.endpoint}/upload-image`, file!, fields);
  }

  deleteImage(id: number): Observable<CharacterModel> {
    return this.apiService.deleteResource<CharacterModel>(this.namespace, this.endpoint, id);
  }
}
