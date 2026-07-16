import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardBtnComponent } from './dashboard-btn-component';

describe('DashboardBtnComponent', () => {
  let component: DashboardBtnComponent;
  let fixture: ComponentFixture<DashboardBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardBtnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardBtnComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
