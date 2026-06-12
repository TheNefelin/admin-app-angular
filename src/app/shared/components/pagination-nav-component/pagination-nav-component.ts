import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination-nav-component',
  imports: [],
  templateUrl: './pagination-nav-component.html',
})
export class PaginationNavComponent {
  readonly currentPage = input<number>(1);
  readonly totalPages = input<number>(1);
  protected readonly prevPage = output<void>();
  protected readonly nextPage = output<void>();
}
