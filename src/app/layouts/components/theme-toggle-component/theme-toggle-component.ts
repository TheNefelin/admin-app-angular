import { Component, DOCUMENT, effect, inject, signal } from '@angular/core';

@Component({
  selector: 'app-theme-toggle-component',
  imports: [],
  templateUrl: './theme-toggle-component.html',
})
export class ThemeToggleComponent {
  private doc = inject(DOCUMENT);
  private readonly STORAGE_KEY = 'theme';

  private getSystemTheme = (): 'light' | 'dark' =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

  private getSavedOrDefault = (): 'light' | 'dark' => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.STORAGE_KEY) as 'light' | 'dark' | null;
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return this.getSystemTheme();
  };

  readonly theme = signal<'light' | 'dark'>(this.getSavedOrDefault());

  private syncTheme = effect(() => {
    this.doc.documentElement.setAttribute('data-theme', this.theme());
  });

  toggle(): void {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    localStorage.setItem(this.STORAGE_KEY, next);
  }
}
