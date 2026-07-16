import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioLayoutComponent } from './portfolio-layout-component';

describe('PortfolioLayoutComponent', () => {
  let component: PortfolioLayoutComponent;
  let fixture: ComponentFixture<PortfolioLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioLayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
