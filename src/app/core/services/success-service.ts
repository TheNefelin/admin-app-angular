import { Service, signal } from "@angular/core";

export interface ToastModel {
  id: number;
  message: string;
}

@Service()
export class SuccessService {
  readonly toasts = signal<ToastModel[]>([]);
  private nextId = 0;

  show(message: string | null): void {
    if (!message) return;

    const id = ++this.nextId;
    this.toasts.update(toasts => [...toasts, { id, message }]);

    setTimeout(() => this.clear(id), 5000);
  }

  clear(id: number): void {
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }
}
