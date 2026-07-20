import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlPage } from './url-page';

describe('UrlPage', () => {
  let component: UrlPage;
  let fixture: ComponentFixture<UrlPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrlPage],
    }).compileComponents();

    fixture = TestBed.createComponent(UrlPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
