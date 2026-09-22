import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AUTH_ENDPOINTS } from './endpoints/auth.endpoints';
import { getAccessToken } from '../auth/services/token-storage';

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private readonly isLocal =
    typeof window !== 'undefined' && window.location.hostname === 'localhost';

  private baseUrl = this.isLocal ? environment.apiUrlLocal : environment.apiUrl;
  private authUrl = this.isLocal ? environment.authUrlLocal : environment.authUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const jwt = getAccessToken();
    const subdomain = localStorage.getItem('tenant_subdomain') || environment.tenant;
    const lang = localStorage.getItem('preferredLanguage') || 'en';

    let headers = new HttpHeaders({
      'X-Tenant-Subdomain': subdomain,
      'Accept-Language': lang,
    });

    if (jwt) {
      headers = headers.set('Authorization', `Bearer ${jwt}`);
    }

    return headers;
  }

  generatePkce(): Observable<any> {
    return this.http.get(`${this.authUrl}${AUTH_ENDPOINTS.generatePkce}`, {
      headers: this.getHeaders(),
    });
  }

  verifyOtp(username: string, otp: string, codeChallenge: string): Observable<any> {
    return this.http.post(`${this.authUrl}${AUTH_ENDPOINTS.verifyOtp}`, {
      Username: username,
      Otp: otp,
      CodeChallenge: codeChallenge,
      RedirectUri: environment.auth.redirectUri,
    }, { headers: this.getHeaders() });
  }

  verifyResetOtp(username: string, otp: string): Observable<any> {
    return this.http.post(`${this.authUrl}${AUTH_ENDPOINTS.verifyResetOtp}`, {
      Username: username,
      Otp: otp,
    }, { headers: this.getHeaders() });
  }

  getToken(code: string, codeVerifier: string): Observable<any> {
    return this.http.post(`${this.authUrl}${AUTH_ENDPOINTS.token}`, {
      Code: code,
      CodeVerifier: codeVerifier,
      RedirectUri: environment.auth.redirectUri,
    }, { headers: this.getHeaders() });
  }

  forgotPassword(username: string): Observable<any> {
    return this.http.post(`${this.authUrl}${AUTH_ENDPOINTS.forgotPassword}`, {
      username,
    }, { headers: this.getHeaders() });
  }

  resendOtp(username: string): Observable<any> {
    return this.http.post(`${this.authUrl}${AUTH_ENDPOINTS.resendOtp}`, {
      username,
    }, { headers: this.getHeaders() });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.authUrl}${AUTH_ENDPOINTS.login}`, {
      Username: username,
      Password: password,
    }, { headers: this.getHeaders() });
  }

  resetPassword(username: string, newPassword: string, resetToken: string): Observable<any> {
    return this.http.post(`${this.authUrl}${AUTH_ENDPOINTS.resetPassword}`, {
      username,
      token: resetToken,
      newPassword,
    }, { headers: this.getHeaders() });
  }

  setResetToken(token: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('reset_token', token);
    }
  }

  clearResetToken(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('reset_token');
    }
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders(),
    });
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders(),
    });
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders(),
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });
  }

  getBlob(endpoint: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
      responseType: 'blob',
    });
  }

  // Multipart upload - browser sets Content-Type with boundary automatically
  postMultipart<T>(endpoint: string, formData: FormData): Observable<T> {
    const jwt = getAccessToken();
    const subdomain = localStorage.getItem('tenant_subdomain') || environment.tenant;
    let headers = new HttpHeaders({ 'X-Tenant-Subdomain': subdomain });
    if (jwt) {
      headers = headers.set('Authorization', `Bearer ${jwt}`);
    }
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData, { headers });
  }
}
