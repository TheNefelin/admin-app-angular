import { Component, input, output } from '@angular/core';
import { ToastModel } from '@core/services/success-service';

@Component({
  selector: 'app-toast-success-component',
  imports: [],
  templateUrl: './toast-success-component.html',
})
export class ToastSuccessComponent {
  readonly toasts = input<ToastModel[]>([]);
  readonly close = output<number>();
}
