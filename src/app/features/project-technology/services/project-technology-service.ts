import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { ProjectTechnologyModel } from '@features/project-technology/models/project-technology-model';
import { Observable } from 'rxjs';

@Service()
export class ProjectTechnologyService {
  private apiService = inject(ApiService);
  private readonly endpoint = 'project-technology';

  create(item: ProjectTechnologyModel): Observable<ProjectTechnologyModel> {
    return this.apiService.create<ProjectTechnologyModel, ProjectTechnologyModel>(
      this.endpoint, item
    );
  }

  //delete(item: ProjectTechnologyModel): Observable<boolean> {
  //  return this.apiService.delete<boolean>(
  //    this.endpoint, `${item.id_project}/${item.id_technology}`
  //  );
  //}
}
