import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal-action-component',
  imports: [],
  templateUrl: './modal-action-component.html',
})
export class ModalActionComponent {
  readonly title = input<string | null>('Sin Implementar'); 
  readonly message = input<string | null>('Sin Implementar');
  protected readonly onConfirm = output<void>();
  protected readonly onClose = output<void>();
}
