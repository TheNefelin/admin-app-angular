import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from "@angular/router";
import { ModalErrorComponent } from "@shared/components/modal-error-component/modal-error-component";
import { ErrorService } from "@core/services/error-service";
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';

@Component({
  selector: 'app-main-layout-component',
  imports: [
    RouterOutlet,
    ModalErrorComponent
],
  templateUrl: './main-layout-component.html',
})
export class MainLayoutComponent {
  private router = inject(Router);
  
  protected readonly errorService = inject(ErrorService);

  protected goToDashboard(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD]);
  }

  protected goToUrlGrp() : void {
    this.router.navigate([ROUTES_CONSTANTS.URLGRP]);
  }

  protected goToUrl() : void {
    this.router.navigate([ROUTES_CONSTANTS.URL]);
  }
}
