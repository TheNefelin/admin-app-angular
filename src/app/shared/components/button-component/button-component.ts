import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button-component',
  imports: [],
  templateUrl: './button-component.html',
})
export class ButtonComponent {
  readonly icon = input<'create' | 'edit' | 'delete' | 'clear' | 'cancel' | 'refresh' | 'search' | 'save' | 'goto' | null>(null);
  readonly textBtn = input<string>('')
  protected readonly onClick = output<void>();

  protected btnClick(event: Event) {
    event.preventDefault();
    this.onClick.emit()
  }
}
