import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorService } from '@core/services/error-service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);

  return next(req).pipe(
    catchError((error) => {
      const status = error?.status ?? '?';
      const detail = error?.error?.detail;
      let message: string;

      if (typeof detail === 'string') {
        message = detail;
      } else if (Array.isArray(detail)) {
        const first = detail[0];
        const field = first?.loc?.slice(1).join('.') || '';
        const type = first?.type ? ` (${first.type})` : '';
        message = field ? `${field}${type}: ${first.msg}` : (first?.msg || 'Error de validación');
      } else {
        message = error?.message || 'Error inesperado';
      }

      errorService.show(`[${status}] ${message}`);
      return throwError(() => error);
    })
  );
};
