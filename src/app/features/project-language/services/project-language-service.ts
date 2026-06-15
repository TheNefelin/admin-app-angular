import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { ProjectLanguageModel } from '@features/project-language/models/project-language-model';
import { Observable } from 'rxjs';

@Service()
export class ProjectLanguageService {
  private apiService = inject(ApiService)
  private readonly endpoint = 'project-language';

  create(item: ProjectLanguageModel): Observable<ProjectLanguageModel> {
    return this.apiService.create<ProjectLanguageModel, ProjectLanguageModel>(
      this.endpoint, item
    );
  }
}
