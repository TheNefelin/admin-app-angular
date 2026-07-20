import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlGrpPage } from './url-grp-page';

describe('UrlGrpPage', () => {
  let component: UrlGrpPage;
  let fixture: ComponentFixture<UrlGrpPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrlGrpPage],
    }).compileComponents();

    fixture = TestBed.createComponent(UrlGrpPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
