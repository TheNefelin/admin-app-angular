import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideGamesLayoutComponent } from './guide-games-layout-component';

describe('GuideGamesLayoutComponent', () => {
  let component: GuideGamesLayoutComponent;
  let fixture: ComponentFixture<GuideGamesLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideGamesLayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GuideGamesLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
