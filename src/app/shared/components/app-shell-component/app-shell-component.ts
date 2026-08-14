import { Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent, NavbarAuthConfig } from '@layouts/components/navbar-component/navbar-component';

export interface ShellMenuItem {
  label: string;
  icon: 'dashboard' | 'settings';
  action: () => void;
}

@Component({
  selector: 'app-app-shell-component',
  imports: [
    RouterOutlet,
    NavbarComponent,
  ],
  templateUrl: './app-shell-component.html',
})
export class AppShellComponent {
  readonly menuItems = input<ShellMenuItem[]>([]);
  readonly authConfig = input<NavbarAuthConfig | null>(null);
}