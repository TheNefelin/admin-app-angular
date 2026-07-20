import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageFormComponent } from './language-form-component';

describe('LanguageFormComponent', () => {
  let component: LanguageFormComponent;
  let fixture: ComponentFixture<LanguageFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
