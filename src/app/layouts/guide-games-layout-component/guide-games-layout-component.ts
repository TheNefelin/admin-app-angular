import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { AppShellComponent, ShellMenuItem } from '@shared/components/app-shell-component/app-shell-component';

@Component({
  selector: 'app-guide-games-layout-component',
  imports: [
    AppShellComponent,
  ],
  templateUrl: './guide-games-layout-component.html',
})
export class GuideGamesLayoutComponent {
  private readonly router = inject(Router);

  protected readonly menuItems: ShellMenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', action: () => this.goToMain() },
    { label: 'Genres', icon: 'settings', action: () => this.goToGenre() },
    { label: 'Platforms', icon: 'settings', action: () => this.goToPlatform() },
    { label: 'Games', icon: 'settings', action: () => this.goToGame() },
    { label: 'Guides', icon: 'settings', action: () => this.goToGuide() },
  ];

  protected readonly authConfig = { namespace: 'game-guides', label: 'Game Guides' };

  private goToMain(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.ROOT]);
  }

  private goToGenre(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.GAME_GUIDE.GENRE]);
  }

  private goToPlatform(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.GAME_GUIDE.PLATFORM]);
  }

  private goToGame(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.GAME_GUIDE.GAME.ROOT]);
  }

  private goToGuide(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.GAME_GUIDE.GUIDE]);
  }
}