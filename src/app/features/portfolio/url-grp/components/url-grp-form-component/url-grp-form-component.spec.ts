import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlGrpFormComponent } from './url-grp-form-component';

describe('UrlGrpFormComponent', () => {
  let component: UrlGrpFormComponent;
  let fixture: ComponentFixture<UrlGrpFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrlGrpFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UrlGrpFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
