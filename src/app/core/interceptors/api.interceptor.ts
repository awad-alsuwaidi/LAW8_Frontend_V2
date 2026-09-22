import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { clearTokens } from '../auth/services/token-storage';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse && isApiResponse(event.body)) {
        return event.clone({ body: markUtc(event.body.data) });
      }
      if (event instanceof HttpResponse && event.body && typeof event.body === 'object') {
        return event.clone({ body: markUtc(event.body) });
      }
      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        clearTokens();
        router.navigate(['/auth/login']);
      }
      return throwError(() => withErrorDetails(error));
    })
  );
};

function isApiResponse(body: unknown): body is { data: unknown; message?: string; success?: boolean } {
  return (
    body !== null &&
    typeof body === 'object' &&
    'data' in (body as object) &&
    'success' in (body as object)
  );
}

/**
 * The API puts field-level details in `error: string[]` next to a generic
 * `message` ("Validation failed"). Pages only read `err.error.message`, so
 * fold the details into it here instead of touching every call site.
 */
function withErrorDetails(error: HttpErrorResponse): HttpErrorResponse {
  const body = error.error as { message?: string; error?: unknown } | null;
  const details = Array.isArray(body?.error) ? (body!.error as unknown[]).filter((d): d is string => typeof d === 'string' && d.trim() !== '') : [];
  if (!body || details.length === 0) return error;
  return new HttpErrorResponse({
    error: { ...body, message: details.join(' • ') },
    headers: error.headers,
    status: error.status,
    statusText: error.statusText,
    url: error.url ?? undefined,
  });
}

// The API stores UTC but serialises DateTime without a zone suffix, so the
// browser would read "2026-09-22T08:45:00" as local time. Append "Z" to any
// zone-less ISO date-time so every Date/pipe in the app treats it as UTC.
const ZONELESS_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;

function markUtc<T>(value: T): T {
  if (typeof value === 'string') return (ZONELESS_ISO.test(value) ? value + 'Z' : value) as T;
  if (Array.isArray(value)) { for (let i = 0; i < value.length; i++) value[i] = markUtc(value[i]); return value; }
  if (value && typeof value === 'object' && !(value instanceof Blob)) {
    const o = value as Record<string, unknown>;
    for (const k of Object.keys(o)) o[k] = markUtc(o[k]);
  }
  return value;
}
