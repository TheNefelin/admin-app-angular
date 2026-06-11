import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorService } from '@core/services/error-service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      const message = error?.error?.message || error?.message || 'Error inesperado';
      inject(ErrorService).show(message);
      return throwError(() => error);
    })
  );
};
