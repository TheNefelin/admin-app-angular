import { TestBed } from '@angular/core/testing';

import { ProjectTechnologyService } from './project-technology-service';

describe('ProjectTechnologyService', () => {
  let service: ProjectTechnologyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectTechnologyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
