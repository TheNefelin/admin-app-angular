import { Component, computed, effect, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { LoadingComponent } from "../loading-component/loading-component";
import { SelectItemModel } from '@shared/models/select-item-model';

@Component({
  selector: 'app-select-search-component',
  imports: [
    LoadingComponent
  ],
  templateUrl: './select-search-component.html',
})
export class SelectSearchComponent {
  readonly items = input.required<SelectItemModel[]>();
  readonly selectedId = input<number | undefined>(undefined);
  readonly isLoading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly placeholder = input<string>('Buscar...');
  readonly placeholderWhenSelected = input<string | null>(null);
  readonly selectionChange = output<SelectItemModel>();
  readonly cleared = output<void>();

  readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly searchText = signal('');
  protected readonly isOpen = signal(false);
  protected readonly selectedItemInternal = signal<SelectItemModel | null>(null);

  private readonly syncInitial = effect(() => {
    const id = this.selectedId();
    const list = this.items();
    if (id && list?.length) {
      const found = list.find((item) => item.id === id);
      if (found) {
        this.selectedItemInternal.set(found);
        this.searchText.set(found.name);
      }
    } else if (!id) {
      this.selectedItemInternal.set(null);
      this.searchText.set('');
    }
  });

  protected readonly selectedItem = computed(() => {
    const internal = this.selectedItemInternal();
    if (internal) return internal;
    const id = this.selectedId();
    if (id) {
      return this.items().find(item => item.id === id) ?? null;
    }
    return null;
  });

  protected readonly displayPlaceholder = computed(() => {
    const sel = this.selectedItem();
    if (sel) {
      const ph = this.placeholderWhenSelected();
      return ph ?? sel.name;
    }
    return this.placeholder();
  });

  protected readonly filteredItems = computed(() => {
    const term = this.searchText().toLowerCase().trim();
    const list = this.items();
    if (!term) return list;
    return list.filter((item) => item.name.toLowerCase().includes(term));
  });

  protected onSearch(value: string): void {
    this.searchText.set(value);
    this.isOpen.set(true);
    if (this.selectedItemInternal() && value !== this.selectedItemInternal()!.name) {
      this.selectedItemInternal.set(null);
    }
  }

  protected select(item: SelectItemModel, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.selectedItemInternal.set(item);
    this.searchText.set(item.name);
    this.isOpen.set(false);
    this.inputRef()?.nativeElement.blur();
    this.selectionChange.emit(item);
  }

  protected clearSelection(event?: MouseEvent): void {
    event?.preventDefault();
    this.selectedItemInternal.set(null);
    this.searchText.set('');
    this.cleared.emit();
  }

  protected onBlur(): void {
    setTimeout(() => {
      this.isOpen.set(false);
      if (!this.selectedItemInternal()) {
        this.searchText.set('');
      }
    }, 150);
  }

  protected highlight(text: string): string {
    const term = this.searchText().trim();
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(
      regex,
      '<mark class="bg-primary/20 text-primary font-semibold rounded">$1</mark>'
    );
  }
}
