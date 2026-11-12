import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const AuthRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const isAuthEndpoint = req.url.includes('/auth/');

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthEndpoint) {
        return throwError(() => err);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return auth.refreshToken().pipe(
          switchMap((res: any) => {
            isRefreshing = false;

            const body = res?.data ?? res?.result ?? res;
            const newToken =
              body?.accessToken ?? body?.token ?? body?.access_token;
            const newRefresh =
              body?.refreshToken ?? body?.refresh_token;

            if (!newToken) {
              auth.logout();
              return throwError(() => err);
            }

            auth.setTokens(newToken, newRefresh);
            refreshTokenSubject.next(newToken);

            return next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              })
            );
          }),
          catchError((refreshErr) => {
            isRefreshing = false;
            auth.logout();
            return throwError(() => refreshErr);
          })
        );
      }

      return refreshTokenSubject.pipe(
        filter((t): t is string => t !== null),
        take(1),
        switchMap((t) =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${t}` } }))
        )
      );
    })
  );
};