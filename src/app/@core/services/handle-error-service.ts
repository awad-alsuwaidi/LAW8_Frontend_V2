import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class HandleErrorService {
  constructor(private authService: AuthService) {}
  public handleError(error: any) {
    if (error instanceof HttpResponse) {
      return;
    }

    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        console.warn('Unauthorized - logging out');
        this.authService.logout();
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
