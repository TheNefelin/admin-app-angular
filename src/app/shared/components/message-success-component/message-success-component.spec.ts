import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageSuccessComponent } from './message-success-component';

describe('MessageSuccessComponent', () => {
  let component: MessageSuccessComponent;
  let fixture: ComponentFixture<MessageSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageSuccessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageSuccessComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
