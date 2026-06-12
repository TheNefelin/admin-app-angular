import { Component, output, signal } from '@angular/core';
import { ButtonComponent } from "../button-component/button-component";
import { debounceTime, distinctUntilChanged, merge } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-pagination-filter-component',
  imports: [
    ButtonComponent
  ],
  templateUrl: './pagination-filter-component.html',
})
export class PaginationFilterComponent {
  readonly onFilterChange = output<{ search: string; limit: number }>();
  readonly onRefreshClick = output<void>();

  protected searchValue = signal('');
  protected limitValue = signal('10');

  private filterSub = merge(
    toObservable(this.searchValue).pipe(debounceTime(300), distinctUntilChanged()),
    toObservable(this.limitValue).pipe(debounceTime(300), distinctUntilChanged()),
  ).pipe(takeUntilDestroyed()).subscribe(() => {
    this.onFilterChange.emit({
      search: this.searchValue(),
      limit: Number(this.limitValue()) || 10,
    });
  });

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
    } else {
      input.value = sanitized;
      this.limitValue.set(sanitized);
    }
  }
}
