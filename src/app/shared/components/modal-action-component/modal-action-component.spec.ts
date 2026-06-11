import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalActionComponent } from './modal-action-component';

describe('ModalActionComponent', () => {
  let component: ModalActionComponent;
  let fixture: ComponentFixture<ModalActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalActionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalActionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
