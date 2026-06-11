import { Service, signal } from '@angular/core';

@Service()
export class ErrorService {
  readonly error = signal<string | null>(null);

  show(message: string): void {
    this.error.set(message);
  }

  clear(): void {
    this.error.set(null);
  }
}
