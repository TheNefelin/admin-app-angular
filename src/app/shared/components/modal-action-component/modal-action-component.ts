import { Component, input, output } from '@angular/core';
import { LoadingComponent } from "../loading-component/loading-component";

@Component({
  selector: 'app-modal-action-component',
  imports: [
    LoadingComponent
  ],
  templateUrl: './modal-action-component.html',
})
export class ModalActionComponent {
  readonly isLoading = input<boolean>(false);
  readonly title = input<string | null>('Sin Implementar'); 
  readonly message = input<string | null>('Sin Implementar');
  protected readonly onConfirm = output<void>();
  protected readonly onClose = output<void>();
}
