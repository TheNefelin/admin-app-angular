import { Service, signal } from '@angular/core';

export type ToastType = 'success' | 'info';

export interface ToastModel {
  id: number;
  message: string;
  type: ToastType;
}

@Service()
export class SuccessService {
  readonly toasts = signal<ToastModel[]>([]);
  private nextId = 0;

  show(message: string | null, type: ToastType = 'success'): void {
    if (!message) return;

    const id = ++this.nextId;
    this.toasts.update(toasts => [...toasts, { id, message, type }]);

    setTimeout(() => this.clear(id), 5000);
  }

  clear(id: number): void {
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }
}
