import { Routes } from "@angular/router";
import { GamePage } from "./pages/game-page/game-page";
import { GameFormPage } from "./pages/game-form-page/game-form-page";

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
