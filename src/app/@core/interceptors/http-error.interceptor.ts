import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { EMPTY, Observable, catchError, finalize, tap, throwError } from "rxjs";
import { HandleErrorService } from "../services/handle-error-service";
import { LoadingService } from "../services/loading.service";

export const HttpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const _handleErrorService = inject(HandleErrorService);
  const _loading = inject(LoadingService);


 _loading.show();

  return next(req).pipe(
    tap({
      next: (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          _handleErrorService.handleError(event); 
        }
      },
      error: (error: HttpErrorResponse) => {
      },
    }),
    catchError((error: HttpErrorResponse) => {
      _handleErrorService.handleError(error);
    return throwError(() => error);
   }),
    finalize(() => {
       _loading.hide();
    })
  );
};