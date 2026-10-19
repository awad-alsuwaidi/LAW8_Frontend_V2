import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  private normalize<T>(source$: Observable<any>): Observable<T> {
    return source$.pipe(
      map((res: any) => {
        if (res && (res.isSuccess !== undefined || res.result !== undefined)) {
          return res;
        }
        if (res && res.success !== undefined) {
          return {
            isSuccess: res.success === true,
            result: res.data,
            message: res.message,
            error: res.error,
          };
        }
        return res;
      })
    );
  }

  private resolveBase(apiUrl: string): string {
    const clean = apiUrl.replace(/^\/+/, '');
    const isAuth = clean.toLowerCase().startsWith('auth/');
    return isAuth ? environment.authUrl : environment.apiUrl;
  }

  private getFullUrl(apiUrl: string): string {
    const clean = apiUrl.replace(/^\/+/, '');
    return `${this.resolveBase(clean)}/${clean}`;
  }

  post<T = any>(url: string, body: any, params?: {}): Observable<T> {
    if (params) url += this.getParams(params);
    return this.normalize<T>(this.http.post(this.getFullUrl(url), body));
  }

  put<T = any>(url: string, body: any, params?: {}): Observable<T> {
    if (params) url += this.getParams(params);
    return this.normalize<T>(this.http.put(this.getFullUrl(url), body));
  }

  get<T = any>(url: string, params?: {}, headers?: any): Observable<T> {
    if (params) url += this.getParams(params);
    const fullUrl = this.getFullUrl(url);
    const httpOptions = headers ? { headers: new HttpHeaders(headers) } : {};
    return this.normalize<T>(this.http.get(fullUrl, httpOptions));
  }

  delete<T = any>(url: string, params?: {}, options?: any): Observable<T> {
    if (params) url += this.getParams(params);
    return this.normalize<T>(this.http.delete(this.getFullUrl(url), options));
  }

  getBlob(url: string, params?: {}): Observable<Blob> {
    if (params) url += this.getParams(params);
    return this.http.get(this.getFullUrl(url), { responseType: 'blob' });
  }
patch<T = any>(url: string, body: any = {}, params?: {}): Observable<T> {
  if (params) url += this.getParams(params);
  return this.normalize<T>(this.http.patch(this.getFullUrl(url), body));
}

private getParams(args: any): string {
    if (!args) return '';
    const params = Object.keys(args)
      .filter((key) => args[key] != null)
      .map((key) => this.optionToString(key, args[key]))
      .filter((p) => p !== '')
      .join('&');
    return params ? `?${params}` : '';
  }

  private optionToString(key: string, value: any): string {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) {
      return value.map((element, index) => `${key}[${index}]=${element}`).join('&');
    }
    if (typeof value === 'object') {
      return Object.keys(value)
        .map((element) => {
          const serialized = this.serializeObject(value[element], `${key}[${element}]`);
          return Array.isArray(value[element])
            ? serialized
            : `${key}[${element}]=${value[element]}`;
        })
        .join('&');
    }
    return `${key}=${value}`;
  }

  private serializeObject(obj: any, parentSerialized: string): string {
    return Object.keys(obj)
      .map((key) => {
        const value = obj[key];
        if (typeof value === 'object') {
          return this.serializeObject(value, `${parentSerialized}[${key}]`);
        }
        return `${parentSerialized}[${key}]=${value}`;
      })
      .join('&');
  }
}