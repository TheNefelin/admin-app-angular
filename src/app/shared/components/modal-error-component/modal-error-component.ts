import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal-error-component',
  imports: [],
  templateUrl: './modal-error-component.html',
})
export class ModalErrorComponent {
  readonly message = input<string | null>('Sin Implementar');
  readonly close = output<void>();
}
