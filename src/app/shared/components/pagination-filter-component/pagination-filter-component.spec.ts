import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationFilterComponent } from './pagination-filter-component';

describe('PaginationFilterComponent', () => {
  let component: PaginationFilterComponent;
  let fixture: ComponentFixture<PaginationFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationFilterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
