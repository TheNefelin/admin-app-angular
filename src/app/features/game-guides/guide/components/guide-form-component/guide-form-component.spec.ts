import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideFormComponent } from './guide-form-component';

describe('GuideFormComponent', () => {
  let component: GuideFormComponent;
  let fixture: ComponentFixture<GuideFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GuideFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
