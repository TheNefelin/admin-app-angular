import { TestBed } from '@angular/core/testing';

import { ProjectLanguageService } from './project-language-service';

describe('ProjectLanguageService', () => {
  let service: ProjectLanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectLanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
