import { HttpInterceptorFn } from '@angular/common/http';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const clonedRequest = req.clone({
    setHeaders: {
      'X-Tenant-Subdomain': 'admin'
    }
  });

  return next(clonedRequest);
};