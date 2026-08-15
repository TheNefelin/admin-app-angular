import { inject, Service, type WritableSignal } from '@angular/core';
import { finalize, type Observable } from 'rxjs';
import { SuccessService } from '@core/services/success-service';

interface MutationOptions {
  successMsg: string;
  errorMsg: string;
  onSuccess?: () => void;
  onFinalize?: () => void;
}

@Service()
export class MutationService {
  private readonly successService = inject(SuccessService);

  run<T>(
    action: Observable<T>,
    state: { isSaving: WritableSignal<boolean> },
    options: MutationOptions,
  ): void {
    state.isSaving.set(true);
    action.pipe(
      finalize(() => {
        state.isSaving.set(false);
        options.onFinalize?.();
      })
    ).subscribe({
      next: () => {
        this.successService.show(options.successMsg);
        options.onSuccess?.();
      },
      error: (err) => {
        console.error(`[${options.errorMsg}]:`, err);
      }
    });
  }
}