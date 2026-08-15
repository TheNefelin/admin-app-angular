import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth-service';
import { SuccessService } from '@core/services/success-service';

const NAMESPACE_REGEX = /^\/ssr-api\/([^/]+)\//;

function namespaceOf(url: string): string | null {
  const match = url.match(NAMESPACE_REGEX);
  return match ? match[1] : null;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const successService = inject(SuccessService);

  const ns = namespaceOf(req.url);
  if (!ns || req.url.includes('/auth/')) return next(req);

  const token = authService.getAccessToken(ns);
  const authorized = token ? attachToken(req, token) : req;

  return next(authorized).pipe(
    catchError((error) => {
      if (error?.status !== 401 || !token) {
        return throwError(() => error);
      }

      return from(authService.refresh(ns)).pipe(
        switchMap((newToken) => {
          if (!newToken) {
            authService.logout(ns);
            successService.show('Sesión expirada, inicia sesión de nuevo', 'info');
            return throwError(() => error);
          }
          return next(attachToken(req, newToken));
        }),
      );
    }),
  );
};

function attachToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
