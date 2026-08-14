import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { AppShellComponent, ShellMenuItem } from '@shared/components/app-shell-component/app-shell-component';

@Component({
  selector: 'app-portfolio-layout-component',
  imports: [
    AppShellComponent,
  ],
  templateUrl: './portfolio-layout-component.html',
})
export class PortfolioLayoutComponent {
  private readonly router = inject(Router);

  protected readonly menuItems: ShellMenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', action: () => this.goToDashboard() },
    { label: 'Url Grp', icon: 'settings', action: () => this.goToUrlGrp() },
    { label: 'Url', icon: 'settings', action: () => this.goToUrl() },
    { label: 'Language', icon: 'settings', action: () => this.goToLanguage() },
    { label: 'Technology', icon: 'settings', action: () => this.goToTechnology() },
    { label: 'Project', icon: 'settings', action: () => this.goToProject() },
  ];

  protected readonly authConfig = null;

  private goToDashboard(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD]);
  }

  private goToUrlGrp(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.PORTFOLIO.URLGRP]);
  }

  private goToUrl(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.PORTFOLIO.URL]);
  }

  private goToLanguage(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.PORTFOLIO.LANGUAGE]);
  }

  private goToTechnology(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.PORTFOLIO.TECHNOLOGY]);
  }

  private goToProject(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.PORTFOLIO.PROJECT.ROOT]);
  }
}