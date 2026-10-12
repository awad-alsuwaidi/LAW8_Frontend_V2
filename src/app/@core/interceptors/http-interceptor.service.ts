import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';

export const AppHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const _authService = inject(AuthService);   // ★
  const _languageService = inject(LanguageService);

  // ★ الـ signal هي مصدر الحقيقة، وبترجع من sessionStorage كـ fallback
  const token = _authService.getAccessToken();

  console.log('🔐 Interceptor:', req.method, req.url, '| Token:', !!token);

  const headersToAppend: Record<string, string> = {};

  headersToAppend['X-Tenant-Subdomain'] = environment.subDomain;

  if (token) {
    headersToAppend['Authorization'] = `Bearer ${token}`;
  }

  if (!(req.body instanceof FormData)) {
    headersToAppend['Content-Type'] = 'application/json';
  }

  const preferredLanguage = _languageService.getSelectedLanguage();
  if (preferredLanguage) {
    headersToAppend['lang'] = preferredLanguage;
  }

  const modifiedReq = req.clone({ setHeaders: headersToAppend });
  return next(modifiedReq);
};
