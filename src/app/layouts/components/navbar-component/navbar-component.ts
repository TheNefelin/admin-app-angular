import { Component } from '@angular/core';
import { ThemeToggleComponent } from "../theme-toggle-component/theme-toggle-component";

@Component({
  selector: 'app-navbar-component',
  imports: [
    ThemeToggleComponent
  ],
  templateUrl: './navbar-component.html',
})
export class NavbarComponent {}
