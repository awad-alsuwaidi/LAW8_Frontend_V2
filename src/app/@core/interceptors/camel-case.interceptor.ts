import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export const CamelCaseInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse && event.body) {
        const modifiedBody = convertKeysToCamel(event.body);
        return event.clone({ body: modifiedBody });
      }
      return event;
    })
  );
};

function convertKeysToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => convertKeysToCamel(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      acc[camelKey] = convertKeysToCamel(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}
