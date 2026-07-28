import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameFormComponent } from './game-form-component';

describe('GameFormComponent', () => {
  let component: GameFormComponent;
  let fixture: ComponentFixture<GameFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
