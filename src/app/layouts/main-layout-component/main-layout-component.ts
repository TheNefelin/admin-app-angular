import { Component, inject } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { ModalErrorComponent } from "@shared/components/modal-error-component/modal-error-component";
import { ErrorService } from "@core/services/error-service";

@Component({
  selector: 'app-main-layout-component',
  imports: [
    RouterOutlet,
    ModalErrorComponent
],
  templateUrl: './main-layout-component.html',
})
export class MainLayoutComponent {
  protected readonly errorService = inject(ErrorService);
}
