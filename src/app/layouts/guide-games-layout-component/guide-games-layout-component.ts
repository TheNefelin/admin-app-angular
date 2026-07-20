import { Component, inject } from '@angular/core';
import { ModalErrorComponent } from "@shared/components/modal-error-component/modal-error-component";
import { NavbarComponent } from "@layouts/components/navbar-component/navbar-component";
import { Router, RouterOutlet } from "@angular/router";
import { ErrorService } from '@core/services/error-service';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';

@Component({
  selector: 'app-guide-games-layout-component',
  imports: [
    RouterOutlet,
    ModalErrorComponent, 
    NavbarComponent
  ],
  templateUrl: './guide-games-layout-component.html',
})
export class GuideGamesLayoutComponent {
  private router = inject(Router);
  
  protected readonly errorService = inject(ErrorService);

  protected goToMain(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.ROOT]);
  }

  protected goToGenre(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.GAME_GUIDE.GENRE]);
  }

  protected goToPlatform(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.GAME_GUIDE.PLATFORM]);
  }

  protected goToGame(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.GAME_GUIDE.GAME.ROOT]);
  }
}
