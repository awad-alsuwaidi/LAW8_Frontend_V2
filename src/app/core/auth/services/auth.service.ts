import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';

import { ApiClientService } from '../../api/api-client.service';
import { User } from '../../models/auth/user.model';
import { clearTokens, getAccessToken, saveTokens, setRememberMe } from './token-storage';

const CLAIM = {
  email: ['email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
  id: ['sub', 'nameid', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
  name: ['fullname', 'unique_name', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
  role: ['role', 'RoleName', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
};

function claim(payload: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) { const v = payload[k]; if (v !== undefined && v !== null && v !== '') return v; }
  return undefined;
}

/** Map raw JWT claims to the app's User shape; profile fields are enriched later from the API. */
function userFromJwt(payload: Record<string, unknown>): User {
  const roleClaim = claim(payload, CLAIM.role);
  const roles = Array.isArray(roleClaim) ? roleClaim.map(String) : roleClaim ? [String(roleClaim)] : [];
  return {
    id: String(claim(payload, CLAIM.id) ?? ''),
    email: String(claim(payload, CLAIM.email) ?? ''),
    nameEn: String(claim(payload, CLAIM.name) ?? ''),
    roles: [...new Set(roles)],
    permissions: [],
    active: true,
    locked: false,
  };
}

interface PkceResponse {
  codeChallenge: string;
  codeVerifier: string;
}

interface VerifyOtpResponse {
  code?: string;
}

interface TokenResponse {
  accessToken?: string;
  refreshToken?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  private codeChallenge: string | null = null;
  private codeVerifier: string | null = null;

  private username: string | null = null;

  private readonly redirectUri = 'http://localhost/callback';
  private readonly otpFlowKey = 'auth_otp_flow';
  private readonly usernameKey = 'auth_username';
  private readonly pkceVerifierKey = 'pkce_verifier';
  private readonly resetTokenKey = 'auth_reset_token';

  constructor(private apiClient: ApiClientService) {
    this.loadCurrentUser();
    this.loadUsername();
    this.loadPkceVerifier();
  }

login(username: string, password: string, rememberMe = false): Observable<any> {
  this.username = username.trim();
  this.setUsername(this.username);
  // Decided here, before the OTP step, so getToken() knows which store to use.
  setRememberMe(rememberMe, this.username);

  return this.apiClient.generatePkce().pipe(
    tap((pkce: PkceResponse) => {
      this.codeChallenge = pkce.codeChallenge;
      this.codeVerifier = pkce.codeVerifier;

      this.savePkceVerifier(pkce.codeVerifier);
    }),

    switchMap(() =>
      this.apiClient.login(
        this.username!,
        password
      )
    ),
  );
}

  setUsername(username: string): void {
    this.username = username;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.usernameKey, username);
    }
  }

  private loadUsername(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.username = sessionStorage.getItem(this.usernameKey);
  }

  verifyOtp(otp: string): Observable<VerifyOtpResponse> {
    if (!this.username) {
      this.username = this.getStoredUsername();
    }

    if (!this.username) {
      throw new Error('Username is missing.');
    }
    if (!this.codeChallenge) {
      throw new Error('PKCE code challenge is missing.');
    }
    return this.apiClient.verifyOtp(this.username, otp, this.codeChallenge);
  }

  verifyResetOtp(otp: string): Observable<any> {
    if (!this.username) {
      this.username = this.getStoredUsername();
    }

    if (!this.username) {
      throw new Error('Username is missing.');
    }

    return this.apiClient.verifyResetOtp(this.username, otp).pipe(
      tap((response) => {
        const resetToken = response?.resetToken;

        if (!resetToken) {
          throw new Error('Reset token was not returned.');
        }
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(this.resetTokenKey, resetToken);
        }

        this.setOtpFlow('reset');
      }),
    );
  }

  setOtpFlow(flow: 'login' | 'reset'): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.otpFlowKey, flow);
    }
  }

  getOtpFlow(): 'login' | 'reset' | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const flow = sessionStorage.getItem(this.otpFlowKey);

    if (flow === 'login' || flow === 'reset') {
      return flow;
    }

    return null;
  }

  clearOtpFlow(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.otpFlowKey);
    }
  }

  getToken(code: string): Observable<TokenResponse> {
    let verifier = this.codeVerifier;

    if (!verifier) {
      verifier = this.getStoredPkceVerifier();
    }

    if (!verifier) {
      throw new Error('PKCE code verifier is missing.');
    }

    return this.apiClient.getToken(code, verifier).pipe(
      tap((response: TokenResponse) => {
        saveTokens(response?.accessToken, response?.refreshToken);

        this.loadCurrentUser();
        this.clearPkce();
        this.clearSessionData();
      }),
    );
  }

  verifyOtpAndLogin(otp: string): Observable<TokenResponse> {
    return this.verifyOtp(otp).pipe(
      switchMap((response) => {
        const code = response?.code;

        if (!code) {
          throw new Error('Authorization code was not returned.');
        }

        return this.getToken(code);
      }),
    );
  }

  forgotPassword(username: string): Observable<any> {
    return this.apiClient.forgotPassword(username);
  }

  resendOtp(username: string): Observable<any> {
    return this.apiClient.resendOtp(username);
  }

  getUsername(): string | null {
    if (!this.username && typeof window !== 'undefined') {
      this.username = sessionStorage.getItem(this.usernameKey);
    }
    return this.username;
  }

  getCodeChallenge(): string | null {
    return this.codeChallenge;
  }

  getRedirectUri(): string {
    return this.redirectUri;
  }

  private clearPkce(): void {
    this.codeChallenge = null;
    this.codeVerifier = null;
  }

  private savePkceVerifier(verifier: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.pkceVerifierKey, verifier);
    }
  }

  private loadPkceVerifier(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = sessionStorage.getItem(this.pkceVerifierKey);
    if (stored) {
      this.codeVerifier = stored;
    }
  }

  private getStoredPkceVerifier(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return sessionStorage.getItem(this.pkceVerifierKey);
  }

  private getStoredUsername(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return sessionStorage.getItem(this.usernameKey);
  }

  private clearSessionData(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.pkceVerifierKey);
      sessionStorage.removeItem(this.usernameKey);
      sessionStorage.removeItem(this.otpFlowKey);
    }
  }

  setToken(token: string): void {
    saveTokens(token, null);
    this.loadCurrentUser();
  }

  getStoredToken(): string | null {
    return getAccessToken();
  }

  logout(): void {
    // Tokens go from both stores; the "remember me" preference and username stay
    // so the next login form is prefilled.
    clearTokens();
    sessionStorage.removeItem('tenant_subdomain');

    this.username = null;
    this.clearPkce();
    this.clearSessionData();

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
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>;
      const user = userFromJwt(decoded);
      this.currentUserSubject.next(user);
      this.enrichCurrentUser(user.id);
    } catch {
      this.currentUserSubject.next(null);
    }
  }

  /** Pull the full profile (Arabic name, status, roles) from the platform users API; JWT data stays if it fails. */
  private enrichCurrentUser(id: string): void {
    if (!id) return;
    this.apiClient.get<Partial<User> & { active?: boolean; locked?: boolean }>(`/platform/users/${id}`).subscribe({
      next: (u) => {
        const base = this.currentUserSubject.value;
        if (!base || !u) return;
        this.currentUserSubject.next({
          ...base,
          nameEn: u.nameEn || base.nameEn,
          nameAr: u.nameAr ?? base.nameAr,
          email: u.email || base.email,
          roles: u.roles?.length ? u.roles : base.roles,
          active: u.active ?? base.active,
          locked: u.locked ?? base.locked,
        });
      },
      error: () => { /* keep JWT-derived user */ },
    });
  }

  resetPassword(username: string, newPassword: string): Observable<any> {
    const resetToken = this.getResetToken();

    if (!resetToken) {
      throw new Error('Reset token is missing. Please complete the OTP verification first.');
    }

    return this.apiClient.resetPassword(username, newPassword, resetToken);
  }

  getResetToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return sessionStorage.getItem(this.resetTokenKey);
  }
}
