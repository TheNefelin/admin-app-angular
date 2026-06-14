import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnologyFormComponent } from './technology-form-component';

describe('TechnologyFormComponent', () => {
  let component: TechnologyFormComponent;
  let fixture: ComponentFixture<TechnologyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnologyFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TechnologyFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
