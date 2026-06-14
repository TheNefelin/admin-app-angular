import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnologyPage } from './technology-page';

describe('TechnologyPage', () => {
  let component: TechnologyPage;
  let fixture: ComponentFixture<TechnologyPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnologyPage],
    }).compileComponents();

    fixture = TestBed.createComponent(TechnologyPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
