import { inject, Service, type WritableSignal } from '@angular/core';
import { finalize, type Observable } from 'rxjs';
import { SuccessService } from '@core/services/success-service';

interface MutationOptions {
  successMsg: string;
  errorMsg: string;
  onSuccess?: () => void;
  onClose?: () => void;
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
    let succeeded = false;
    state.isSaving.set(true);
    action.pipe(
      finalize(() => {
        state.isSaving.set(false);
        if (succeeded) options.onClose?.();
        options.onFinalize?.();
      })
    ).subscribe({
      next: () => {
        succeeded = true;
        this.successService.show(options.successMsg);
        options.onSuccess?.();
      },
      error: (err) => {
        console.error(`[${options.errorMsg}]:`, err);
      }
    });
  }
}