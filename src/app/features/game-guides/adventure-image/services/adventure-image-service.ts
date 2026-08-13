import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { API_NAMESPACE } from '@shared/constants/routes-constant';
import { Observable } from 'rxjs';
import { AdventureImageModel, SaveAdventureImageModel } from '@features/game-guides/adventure-image/models/adventure-image-model';

@Service()
export class AdventureImageService {
  private apiService = inject(ApiService);
  private readonly namespace = API_NAMESPACE.GAME_GUIDES;
  private readonly endpoint = 'adventure-images';

  uploadImage(data: SaveAdventureImageModel): Observable<AdventureImageModel> {
    const fields: Record<string, string> = { adventure_id: data.adventure_id.toString() };
    if (data.alt_text) fields['alt_text'] = data.alt_text;
    if (data.sort_order !== undefined) fields['sort_order'] = data.sort_order.toString();

    return this.apiService.postWithFile<AdventureImageModel>(
      this.namespace, `${this.endpoint}/upload-image`, data.file!, fields
    );
  }

  deleteImage(id: number): Observable<void> {
    return this.apiService.deleteResource<void>(
      this.namespace, this.endpoint, id
    );
  }
}
