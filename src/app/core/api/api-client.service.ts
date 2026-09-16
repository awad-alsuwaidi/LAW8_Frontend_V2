import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from './api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private baseUrl = environment.apiUrl;
  private authUrl = environment.authUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const jwt = sessionStorage.getItem('auth_token');

    const subdomain = localStorage.getItem('tenant_subdomain') || environment.tenant;

    let headers = new HttpHeaders({
      'X-Tenant-Subdomain': subdomain,
    });

    if (jwt) {
      headers = headers.set('Authorization', `Bearer ${jwt}`);
    }

    return headers;
  }

  generatePkce(): Observable<any> {
    return this.http.get(`${this.authUrl}${API_ENDPOINTS.auth.generatePkce}`);
  }

  verifyOtp(username: string, otp: string, codeChallenge: string): Observable<any> {
    return this.http.post(`${this.authUrl}${API_ENDPOINTS.auth.verifyOtp}`, {
      Username: username,
      Otp: otp,
      CodeChallenge: codeChallenge,
      RedirectUri: environment.auth.redirectUri,
    });
  }

  verifyResetOtp(username: string, otp: string): Observable<any> {
    return this.http.post(`${this.authUrl}${API_ENDPOINTS.auth.verifyResetOtp}`, {
      username,
      otp,
    });
  }

  getToken(code: string, codeVerifier: string): Observable<any> {
    return this.http.post(`${this.authUrl}${API_ENDPOINTS.auth.token}`, {
      Code: code,
      CodeVerifier: codeVerifier,
      RedirectUri: environment.auth.redirectUri,
    });
  }

  changePassword(code: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.authUrl}${API_ENDPOINTS.auth.changePassword}`, {
      code,
      newPassword,
    });
  }

  forgotPassword(username: string): Observable<any> {
    return this.http.post(`${this.authUrl}${API_ENDPOINTS.auth.forgotPassword}`, {
      username,
    });
  }

  resendOtp(username: string): Observable<any> {
    return this.http.post(`${this.authUrl}${API_ENDPOINTS.auth.resendOtp}`, {
      username,
    });
  }

  
login(username: string, password: string): Observable<any> {
  return this.http.post<any>(
    `${this.authUrl}${API_ENDPOINTS.auth.login}`,
    {
      Username: username,
      Password: password,
    }
  );
}


 resetPassword(
  username: string,
  newPassword: string,
  resetToken: string
): Observable<any> {
  return this.http.post(
    `${this.authUrl}${API_ENDPOINTS.auth.resetPassword}`,
    {
      username,
      token: resetToken,
      newPassword,
    }
  );
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
}
