import { Component, input, output } from '@angular/core';
import { ButtonComponent } from "../button-component/button-component";

@Component({
  selector: 'app-modal-confirm-component',
  imports: [
    ButtonComponent
  ],
  templateUrl: './modal-confirm-component.html',
})
export class ModalConfirmComponent {
  readonly title = input<string | null>('Sin Implementar'); 
  readonly message = input<string | null>('Sin Implementar');
  protected readonly onConfirm = output<void>();
  protected readonly onClose = output<void>();
}
