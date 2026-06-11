import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal-action-component',
  imports: [],
  templateUrl: './modal-action-component.html',
})
export class ModalActionComponent {
  readonly title = input<string | null>('Sin Implementar'); 
  readonly message = input<string | null>('Sin Implementar');
  readonly confirm = output<void>();
  readonly close = output<void>();
}
