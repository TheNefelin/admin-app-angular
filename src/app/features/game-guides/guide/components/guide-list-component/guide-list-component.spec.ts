import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideListComponent } from './guide-list-component';

describe('GuideListComponent', () => {
  let component: GuideListComponent;
  let fixture: ComponentFixture<GuideListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GuideListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
