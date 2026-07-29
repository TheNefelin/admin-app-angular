import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourcesFormComponent } from './source-form-component';

describe('SourceFormComponent', () => {
  let component: SourcesFormComponent;
  let fixture: ComponentFixture<SourcesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourcesFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SourcesFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
