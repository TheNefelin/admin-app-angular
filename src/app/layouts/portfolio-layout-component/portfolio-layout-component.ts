import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ErrorService } from '@core/services/error-service';
import { SuccessService } from '@core/services/success-service';
import { ConfirmService } from '@core/services/confirm-service';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { ModalErrorComponent } from '@shared/components/modal-error-component/modal-error-component';
import { ToastSuccessComponent } from '@shared/components/toast-success-component/toast-success-component';
import { ModalConfirmComponent } from '@shared/components/modal-confirm-component/modal-confirm-component';
import { NavbarComponent } from '@layouts/components/navbar-component/navbar-component';

@Component({
  selector: 'app-portfolio-layout-component',
  imports: [
    RouterOutlet,
    ModalErrorComponent,
    ToastSuccessComponent,
    ModalConfirmComponent,
    NavbarComponent
],
  templateUrl: './portfolio-layout-component.html',
})
export class PortfolioLayoutComponent {
  private router = inject(Router);

  protected readonly errorService = inject(ErrorService);
  protected readonly successService = inject(SuccessService);
  protected readonly confirmService = inject(ConfirmService);

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
