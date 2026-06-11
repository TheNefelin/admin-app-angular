import { inject, Service } from '@angular/core';
import { UrlModel } from '../models/url-model';
import { ApiService } from '@core/services/api-service';
import { Observable } from 'rxjs';

@Service()
export class UrlService {
  private apiService = inject(ApiService)
  private readonly endpoint = 'url';
  
  getById(id: number): Observable<UrlModel | null> {
    return this.apiService.getById<UrlModel | null>(
      this.endpoint, id
    );
  }
}
