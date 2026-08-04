import { Service, signal } from "@angular/core";

export interface ConfirmOptions {
  title: string;
  message: string;
}

@Service()
export class ConfirmService {
  readonly dialog = signal<ConfirmOptions | null>(null);
  private resolveFn: ((ok: boolean) => void) | null = null;

  confirm(options: ConfirmOptions): Promise<boolean> {
    this.dialog.set(options);
    return new Promise<boolean>((resolve) => {
      this.resolveFn = resolve;
    });
  }

  accept(): void {
    this.resolveFn?.(true);
    this.close();
  }

  reject(): void {
    this.resolveFn?.(false);
    this.close();
  }

  private close(): void {
    this.dialog.set(null);
    this.resolveFn = null;
  }
}
