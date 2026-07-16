import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ErrorService } from '@core/services/error-service';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { ModalErrorComponent } from "@shared/components/modal-error-component/modal-error-component";
import { NavbarComponent } from "@layouts/components/navbar-component/navbar-component";

@Component({
  selector: 'app-portfolio-layout-component',
  imports: [
    RouterOutlet,
    ModalErrorComponent,
    NavbarComponent
],
  templateUrl: './portfolio-layout-component.html',
})
export class PortfolioLayoutComponent {
  private router = inject(Router);
  
  protected readonly errorService = inject(ErrorService);

  protected goToDashboard(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD]);
  }

  protected goToUrlGrp() : void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.PORTFOLIO.URLGRP]);
  }

  protected goToUrl() : void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.PORTFOLIO.URL]);
  }

  protected goToLanguage() : void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.PORTFOLIO.LANGUAGE]);
  }

  protected goToTechnology() : void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.PORTFOLIO.TECHNOLOGY]);
  }

  protected goToProject() : void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.PORTFOLIO.PROJECT.ROOT]);
  }
}
