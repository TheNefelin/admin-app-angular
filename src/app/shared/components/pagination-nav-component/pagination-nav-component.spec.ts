import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationNavComponent } from './pagination-nav-component';

describe('PaginationNavComponent', () => {
  let component: PaginationNavComponent;
  let fixture: ComponentFixture<PaginationNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationNavComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationNavComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
