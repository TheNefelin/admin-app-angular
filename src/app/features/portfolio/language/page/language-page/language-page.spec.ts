import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguagePage } from './language-page';

describe('LanguagePage', () => {
  let component: LanguagePage;
  let fixture: ComponentFixture<LanguagePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguagePage],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguagePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
