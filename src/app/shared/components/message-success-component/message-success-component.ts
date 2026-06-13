import { Component, input } from '@angular/core';

@Component({
  selector: 'app-message-success-component',
  imports: [],
  templateUrl: './message-success-component.html',
})
export class MessageSuccessComponent {
  readonly message = input<string | null>(null);
}
