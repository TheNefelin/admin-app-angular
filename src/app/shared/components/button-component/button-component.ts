import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button-component',
  imports: [],
  templateUrl: './button-component.html',
})
export class ButtonComponent {
  readonly icon = input<'create' | 'edit' | 'delete' | 'clear' | 'refresh' | 'search' | null>(null);
  readonly textBtn = input<string>('')
  protected readonly onClick = output<void>();
}
