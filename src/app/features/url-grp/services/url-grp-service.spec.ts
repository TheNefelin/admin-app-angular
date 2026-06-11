import { TestBed } from '@angular/core/testing';

import { UrlGrpService } from './url-grp-service';

describe('UrlGrpService', () => {
  let service: UrlGrpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UrlGrpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
