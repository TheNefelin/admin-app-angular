import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { API_NAMESPACE } from '@shared/constants/routes-constant';
import { Observable } from 'rxjs';
import { AdventureModel, SaveAdventureModel } from '@features/game-guides/adventure/models/adventure-model';

@Service()
export class AdventureService {
  private apiService = inject(ApiService);
  private readonly namespace = API_NAMESPACE.GAME_GUIDES;
  private readonly endpoint = 'adventures';

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
