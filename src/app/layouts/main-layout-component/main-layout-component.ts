import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { AppShellComponent, ShellMenuItem } from '@shared/components/app-shell-component/app-shell-component';

@Component({
  selector: 'app-main-layout-component',
  imports: [
    AppShellComponent,
  ],
  templateUrl: './main-layout-component.html',
})
export class MainLayoutComponent {
  private readonly router = inject(Router);

  protected readonly menuItems: ShellMenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', action: () => this.goToMain() },
  ];

  protected readonly authConfig = null;

  private goToMain(): void {
    this.router.navigate([ROUTES_CONSTANTS.DASHBOARD.ROOT]);
  }
}