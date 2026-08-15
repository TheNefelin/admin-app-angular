import { Component, input } from '@angular/core';
import { ThemeToggleComponent } from '@layouts/components/theme-toggle-component/theme-toggle-component';
import { GoogleAuthComponent } from '@shared/components/google-auth-component/google-auth-component';

export interface NavbarAuthConfig {
  namespace: string;
  label: string;
}

@Component({
  selector: 'app-navbar-component',
  imports: [
    ThemeToggleComponent,
    GoogleAuthComponent
  ],
  templateUrl: './navbar-component.html',
})
export class NavbarComponent {
  readonly authConfig = input<NavbarAuthConfig | null>(null);
}
