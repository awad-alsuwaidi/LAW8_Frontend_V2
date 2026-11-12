import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HandleErrorService {
  public handleError(error: any) {
    if (error instanceof HttpResponse) return;

    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return;
      }

      console.warn('Silent HttpErrorResponse:', {
        url: error.url,
        status: error.status,
        message: error.message,
      });
      return;
    }

    console.error('Unhandled error (ignored silently):', error);
  }
}
