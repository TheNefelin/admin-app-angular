import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { API_NAMESPACE } from '@shared/constants/routes-constant';
import { MapModel, SaveMapModel } from '@features/game-guides/map/models/map-model';
import { Observable } from 'rxjs';

@Service()
export class MapService {
  private apiService = inject(ApiService);
  private readonly namespace = API_NAMESPACE.GAME_GUIDES;
  private readonly endpoint = 'maps';

  create(data: SaveMapModel): Observable<MapModel> {
    const fields: Record<string, string> = { game_id: data.game_id.toString() };
    if (data.alt_text) fields['alt_text'] = data.alt_text;
    if (data.sort_order !== undefined) fields['sort_order'] = data.sort_order.toString();
    return this.apiService.postWithFile<MapModel>(this.namespace, `${this.endpoint}/upload-image`, data.file!, fields);
  }

  delete(id: number): Observable<void> {
    return this.apiService.deleteResource<void>(this.namespace, this.endpoint, id);
  }
}
