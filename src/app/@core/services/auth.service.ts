import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '@core/api/api.service';
import { USER } from '@core/utilities/defines';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';
import { UserProfileDto } from 'src/app/pages/profile/interface/user-profile.interface';
import { Auth_API } from '../api/api-config/auth';
import { DecodedToken } from '../models/decodedToken.interface';
import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment';

export interface PkcePair {
  codeChallenge: string;
  codeVerifier: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _storage = inject(StorageService);
  private _api = inject(ApiService);
  private _router = inject(Router);
  private _storageService = inject(StorageService);
  readonly redirectUri = `${window.location.origin}/auth/callback`;

  //  TEMP 
  private readonly TENANT_KEY = 'tenant_subdomain';

  user: any;
  private _accessToken = signal<string | null>(null);

  private _codeVerifier: string | null = null;
  private _codeChallenge: string | null = null;

  private _loginCredentials: LoginCredentials | null = null;

  private userProfile: WritableSignal<UserProfileDto> = signal<UserProfileDto>(
    {} as UserProfileDto,
  );

  constructor() {
    const storedToken = this._storage.getSession<string>('accessToken');
    if (storedToken) this._accessToken.set(storedToken);

    this.user = this._storage.getLocal(USER) || null;
    this.updateUserProfile(this.user);
  }

  //  TEMP 
  setTenantSubdomain(subdomain: string): void {
    const clean = (subdomain ?? '').trim().toLowerCase();
    if (clean) {
      this._storage.setLocal(this.TENANT_KEY, clean);
    }
  }

  //  TEMP
  getTenantSubdomain(): string {
    return (
      this._storage.getLocal<string>(this.TENANT_KEY) ??
      environment.subDomain ??
      ''
    );
  }

  //  TEMP 
  clearTenantSubdomain(): void {
    this._storage.removeLocal(this.TENANT_KEY);
  }

  setUser(user: any): void {
    this.user = user;
    this._storage.setLocal(USER, user);
  }

  getUserProfile(): UserProfileDto {
    return this.userProfile();
  }

  updateUserProfile(value: Partial<UserProfileDto>): void {
    this.userProfile.update((prev) => ({ ...prev, ...value }));
  }

  setLoginCredentials(creds: LoginCredentials): void {
    this._loginCredentials = creds;
  }

  getLoginCredentials(): LoginCredentials | null {
    return this._loginCredentials;
  }

  clearLoginCredentials(): void {
    this._loginCredentials = null;
  }

  generatePkcePair(): Observable<any> {
    return this._api.get<any>(Auth_API.auth.generatePkcePair).pipe(
      tap((res: any) => {
        const body = res?.result ?? res?.data ?? res;

        const challenge =
          body?.codeChallenge ?? body?.CodeChallenge ?? body?.code_challenge;

        const verifier =
          body?.codeVerifier ?? body?.CodeVerifier ?? body?.code_verifier;

        if (challenge && verifier) {
          this._codeChallenge = challenge;
          this._codeVerifier = verifier;
        }
      }),
    );
  }

  getDecodedToken(): DecodedToken {
    return (this.tryGetDecodedToken() ?? {}) as DecodedToken;
  }

  getDecodedTokenSafe(): DecodedToken | null {
    return this.tryGetDecodedToken();
  }

  private tryGetDecodedToken(): DecodedToken | null {
    const token =
      this._accessToken() ?? this._storage.getSession<string>('accessToken');

    if (!token || typeof token !== 'string') return null;

    try {
      return jwtDecode(token) as DecodedToken;
    } catch {
      return null;
    }
  }

  getCurrentUserId(): string | number | null {
    const decoded: any = this.getDecodedTokenSafe();
    return decoded?.['Id'] ?? decoded?.id ?? decoded?.sub ?? null;
  }

  getCurrentUserName(): string | null {
    const decoded: any = this.getDecodedTokenSafe();
    return (
      decoded?.['userName'] ??
      decoded?.name ??
      decoded?.preferred_username ??
      null
    );
  }

  getCurrentRole(): string | null {
    const decoded: any = this.getDecodedTokenSafe();
    return decoded?.role ?? decoded?.roles?.[0] ?? null;
  }

  getCurrentRoles(): string[] {
    const decoded: any = this.getDecodedTokenSafe();
    if (!decoded) return [];

    const roles =
      decoded.roles ?? decoded.Roles ?? decoded.role ?? decoded.Role ?? null;

    if (Array.isArray(roles)) {
      return roles.filter((r: any) => typeof r === 'string');
    }
    if (typeof roles === 'string') {
      return roles
        .split(',')
        .map((r: string) => r.trim())
        .filter(Boolean);
    }
    return [];
  }

  verifyOtp(payload: {
    username: string;
    otp: string;
    codeChallenge: string;
    redirectUri: string;
  }): Observable<any> {
    return this._api.post(Auth_API.auth.verifyOtp, payload);
  }

  exchangeToken(payload: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
  }): Observable<any> {
    return this._api.post(Auth_API.auth.token, payload);
  }

  refreshToken(): Observable<any> {
    const refresh = this.getRefreshToken();
    return this._api.post(Auth_API.auth.refreshToken, {
      refreshToken: refresh,
    });
  }

  get codeChallenge(): string | null {
    return this._codeChallenge;
  }

  get codeVerifier(): string | null {
    return this._codeVerifier;
  }

  clearPkce(): void {
    this._codeVerifier = null;
    this._codeChallenge = null;
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    this._accessToken.set(accessToken);
    this._storage.setStorage('token', accessToken);
    this._storage.setSession('accessToken', accessToken);

    if (refreshToken) {
      this._storage.setStorage('refreshToken', refreshToken);
      this._storage.setSession('refreshToken', refreshToken);
    }
  }

  getAccessToken(): string | null {
    return this._accessToken();
  }

  getToken(): string | null {
    return this._accessToken();
  }

  getRefreshToken(): string | null {
    return this._storage.getSession<string>('refreshToken');
  }

  hasToken(): boolean {
    return !!this._accessToken();
  }

  hasPermission(permission: string): boolean {
    const decoded: any = this.getDecodedToken();
    if (!decoded) return false;

    const perms =
      decoded.permissions ??
      decoded.Permissions ??
      decoded.claims ??
      decoded.roles ??
      decoded.role ??
      [];

    if (Array.isArray(perms)) {
      return perms.map((p: string) => p.trim()).includes(permission);
    }
    if (typeof perms === 'string') {
      return perms
        .split(',')
        .map((p: string) => p.trim())
        .includes(permission);
    }
    return false;
  }

  logout(): void {
    this._accessToken.set(null);
    this._storage.removeSession('accessToken');
    this._storage.removeSession('refreshToken');
    this.clearPkce();
    this.clearLoginCredentials();

    this.user = null;
    this._storage.clear({ keepKeys: ['lang', 'rememberedUser'] });

    this._router.navigate(['/auth/login']);
  }
}
