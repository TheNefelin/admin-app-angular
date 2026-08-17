import { Component, output, signal } from '@angular/core';
import { ButtonComponent } from '@shared/components/button-component/button-component';
import { outputFromObservable, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map, merge } from 'rxjs';

@Component({
  selector: 'app-pagination-filter-component',
  imports: [
    ButtonComponent
  ],
  templateUrl: './pagination-filter-component.html',
})
export class PaginationFilterComponent {
  readonly refreshClick = output<void>();

  protected searchValue = signal('');
  protected limitValue = signal('10');

  private readonly refreshTrigger = signal(0);

  readonly filterChange = outputFromObservable(
    merge(
      toObservable(this.searchValue).pipe(debounceTime(300), distinctUntilChanged()),
      toObservable(this.limitValue).pipe(debounceTime(300), distinctUntilChanged()),
      toObservable(this.refreshTrigger),
    ).pipe(
      map(() => this.currentFilter()),
    ),
  );

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.applyAndRefresh();
  }

  protected onRefresh(): void {
    this.applyAndRefresh();
  }

  private applyAndRefresh(): void {
    this.refreshTrigger.update(v => v + 1);
    this.refreshClick.emit();
  }

  private currentFilter(): { search: string; limit: number } {
    return {
      search: this.searchValue(),
      limit: Number(this.limitValue()) || 10,
    };
  }

  protected onSearchInput(event: Event): void {
    this.searchValue.set((event.target as HTMLInputElement).value);
  }

  protected onLimitInput(event: Event): void {
    const input = (event.target as HTMLInputElement);
    const sanitized = input.value.replace(/\D/g, '');
    const num = Number(sanitized);
    if (sanitized === '') {
      input.value = '';
      this.limitValue.set('');
    } else if (num < 1) {
      input.value = '1';
      this.limitValue.set('1');
    } else if (num > 100) {
      input.value = '100';
      this.limitValue.set('100');
    } else {
      input.value = sanitized;
      this.limitValue.set(sanitized);
    }
  }
}
