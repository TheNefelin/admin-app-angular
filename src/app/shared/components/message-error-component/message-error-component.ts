import { Component, input } from '@angular/core';

@Component({
  selector: 'app-message-error-component',
  imports: [],
  templateUrl: './message-error-component.html',
})
export class MessageErrorComponent {
  readonly message = input<string | null>(null);
}
