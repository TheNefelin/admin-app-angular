import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { API_NAMESPACE } from '@shared/constants/routes-constant';
import { ScreenshotModel, SaveScreenshotModel } from '../models/screenshot-model';
import { Observable } from 'rxjs';

@Service()
export class ScreenshotService {
  private apiService = inject(ApiService)
  private readonly namespace = API_NAMESPACE.GAME_GUIDES;
  private readonly endpoint = 'screenshots';

  create(data: SaveScreenshotModel): Observable<ScreenshotModel> {
    const fields: Record<string, string> = { game_id: data.game_id.toString() };
    if (data.alt_text) fields['alt_text'] = data.alt_text;
    return this.apiService.postWithFile<ScreenshotModel>(this.namespace, this.endpoint, data.file!, fields);
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(this.namespace, this.endpoint, id);
  }
}
