import { Component, inject } from '@angular/core';
import { ErrorService } from '@core/services/error-service';
import { SuccessService } from '@core/services/success-service';
import { ConfirmService } from '@core/services/confirm-service';
import { ModalErrorComponent } from '@shared/components/modal-error-component/modal-error-component';
import { ToastSuccessComponent } from '@shared/components/toast-success-component/toast-success-component';
import { ModalConfirmComponent } from '@shared/components/modal-confirm-component/modal-confirm-component';

@Component({
  selector: 'app-feedback-host-component',
  imports: [
    ModalErrorComponent,
    ToastSuccessComponent,
    ModalConfirmComponent,
  ],
  templateUrl: './feedback-host-component.html',
})
export class FeedbackHostComponent {
  protected readonly errorService = inject(ErrorService);
  protected readonly successService = inject(SuccessService);
  protected readonly confirmService = inject(ConfirmService);
}