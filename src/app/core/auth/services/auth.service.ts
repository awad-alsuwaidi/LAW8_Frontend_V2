import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, tap, map } from 'rxjs';
import { ApiClientService } from '../../api/api-client.service';

interface PkceResponse {
  codeChallenge: string;
  codeVerifier: string;
}

interface LoginResponse {
  data?: {
    message?: string;
  };
}

interface VerifyOtpResponse {
  data?: {
    code?: string;
  };
}

interface TokenResponse {
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  /**
   * PKCE values must remain in memory until token exchange.
   */
  private codeChallenge: string | null = null;
  private codeVerifier: string | null = null;

  private username: string | null = null;

  constructor(
    private apiClient: ApiClientService
  ) {
    this.loadCurrentUser();
  }


login(
  username: string,
  password: string
): Observable<any> {

  this.username = username;

  return this.apiClient
    .generatePkce()
    .pipe(
      tap((pkce) => {
        this.codeChallenge = pkce.codeChallenge;
        this.codeVerifier = pkce.codeVerifier;
      }),

      switchMap(() =>
        this.apiClient.login(
          username,
          password
        )
      )
    );
}

verifyOtp(
  otp: string
): Observable<any> {

  if (!this.username) {
    throw new Error('Username is missing.');
  }

  if (!this.codeChallenge) {
    throw new Error(
      'PKCE code challenge is missing.'
    );
  }

  return this.apiClient.verifyOtp(
    this.username,
    otp,
    this.codeChallenge
  );
}

getToken(
  code: string
): Observable<any> {

  if (!this.codeVerifier) {
    throw new Error(
      'PKCE code verifier is missing.'
    );
  }

  return this.apiClient
    .getToken(
      code,
      this.codeVerifier
    )
    .pipe(
      tap((response) => {

        const accessToken =
          response?.data?.accessToken;

        const refreshToken =
          response?.data?.refreshToken;

        if (accessToken) {
          localStorage.setItem(
            'auth_token',
            accessToken
          );
        }

        if (refreshToken) {
          localStorage.setItem(
            'refresh_token',
            refreshToken
          );
        }

        this.loadCurrentUser();

        this.clearPkce();
      })
    );
}

/* =========================
   FORGOT PASSWORD
========================= */

forgotPassword(
  email: string
): Observable<any> {

  return this.apiClient
    .forgotPassword(email);
}

/* =========================
   RESEND OTP
========================= */

resendOtp(
  username: string
): Observable<any> {

  return this.apiClient
    .resendOtp(username);
}

  getUsername(): string | null {
    return this.username;
  }

  private clearPkce(): void {
    this.codeChallenge = null;
    this.codeVerifier = null;
  }

  setToken(token: string): void {
    localStorage.setItem(
      'auth_token',
      token
    );

    this.loadCurrentUser();
  }

  getStoredToken(): string | null {
    return localStorage.getItem(
      'auth_token'
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('tenant_subdomain');

    this.username = null;

    this.clearPkce();

    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  private loadCurrentUser(): void {
    const token = this.getStoredToken();

    if (!token) {
      this.currentUserSubject.next(null);
      return;
    }

    try {
      const payload = token.split('.')[1];

      const decoded = JSON.parse(
        atob(
          payload
            .replace(/-/g, '+')
            .replace(/_/g, '/')
        )
      );

      this.currentUserSubject.next(decoded);

    } catch (error) {
      console.error(
        '[AuthService] Invalid token:',
        error
      );

      this.currentUserSubject.next(null);
    }
  }
}