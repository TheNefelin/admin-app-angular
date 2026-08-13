import { Routes } from '@angular/router';
import { GamePage } from '@features/game-guides/game/pages/game-page/game-page';
import { GameFormPage } from '@features/game-guides/game/pages/game-form-page/game-form-page';

export const GAME_ROUTES: Routes = [
  {
    path: '',
    component: GamePage,
  },
  {
    path: 'form',
    component: GameFormPage,
  },
  {
    path: 'form/:id',
    component: GameFormPage,
  },
]
