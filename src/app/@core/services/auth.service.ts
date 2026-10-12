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
  // ==================== DI ====================
  private _storage = inject(StorageService);
  private _api = inject(ApiService);
  private _router = inject(Router);
  private _storageService = inject(StorageService);

  // ==================== Constants ====================
  /** ★ لازم نفس القيمة بالظبط في verify-otp و token */
  readonly redirectUri = `${window.location.origin}/auth/callback`;

  // ==================== State ====================
  user: any;

  /** ★ Access Token في memory — الـ source of truth */
  private _accessToken = signal<string | null>(null);

  /** PKCE */
  private _codeVerifier: string | null = null;
  private _codeChallenge: string | null = null;

  /** Credentials مؤقتة لإعادة إرسال OTP */
  private _loginCredentials: LoginCredentials | null = null;

  /** User profile signal */
  private userProfile: WritableSignal<UserProfileDto> = signal<UserProfileDto>(
    {} as UserProfileDto
  );

  constructor() {
    // استرجاع التوكن من sessionStorage (بعد refresh للصفحة)
    const storedToken = this._storage.getSession<string>('accessToken');
    if (storedToken) this._accessToken.set(storedToken);

    this.user = this._storage.getLocal(USER) || null;
    this.updateUserProfile(this.user);
  }

  // ==================================================================
  // ====================       USER       ============================
  // ==================================================================

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

  // ==================================================================
  // ====================   LOGIN CREDENTIALS   =======================
  // ==================================================================

  setLoginCredentials(creds: LoginCredentials): void {
    this._loginCredentials = creds;
  }

  getLoginCredentials(): LoginCredentials | null {
    return this._loginCredentials;
  }

  clearLoginCredentials(): void {
    this._loginCredentials = null;
  }

  // ==================================================================
  // ====================   OAuth2 + PKCE      ========================
  // ==================================================================

  /** Step 1: اطلب PKCE pair من الباك (GET) */
  /** Step 1: اطلب PKCE pair من الباك (GET) */
generatePkcePair(): Observable<any> {
  return this._api.get<any>(Auth_API.auth.generatePkcePair).pipe(
    tap((res: any) => {
      const body = res?.result ?? res?.data ?? res;

      const challenge =
        body?.codeChallenge ??
        body?.CodeChallenge ??
        body?.code_challenge;

      const verifier =
        body?.codeVerifier ??
        body?.CodeVerifier ??
        body?.code_verifier;

      if (challenge && verifier) {
        this._codeChallenge = challenge;
        this._codeVerifier = verifier;
        console.log('✅ PKCE saved:', { challenge, verifier });
      } else {
        console.error('❌ PKCE keys not found. Full response:', res);
      }
    })
  );
}

/**
 * ★ Legacy — ترجع DecodedToken دايمًا (object فاضي لو مفيش توكن)
 * عشان الكود القديم اللي بيستخدم getDecodedToken()['x'] مايكسرش.
 */
getDecodedToken(): DecodedToken {
  return (this.tryGetDecodedToken() ?? {}) as DecodedToken;
}

/** v2 — آمنة، بترجع null لو مفيش توكن */
getDecodedTokenSafe(): DecodedToken | null {
  return this.tryGetDecodedToken();
}

private tryGetDecodedToken(): DecodedToken | null {
  const token =
    this._accessToken() ??
    this._storage.getSession<string>('accessToken');

  // ★ أهم سطر: لو مفيش توكن، نرجع null بدون ما ننده jwtDecode
  if (!token || typeof token !== 'string') return null;

  try {
    return jwtDecode(token) as DecodedToken;
  } catch (e) {
    console.warn('[AuthService] Failed to decode token', e);
    return null;
  }
}

// ==================================================================
// ====================   CURRENT USER HELPERS  =====================
// ==================================================================

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
    decoded.roles ??
    decoded.Roles ??
    decoded.role ??
    decoded.Role ??
    null;

  if (Array.isArray(roles)) {
    return roles.filter((r: any) => typeof r === 'string');
  }
  if (typeof roles === 'string') {
    return roles.split(',').map((r: string) => r.trim()).filter(Boolean);
  }
  return [];
}
  /** Step 2: verify OTP → auth code */
  verifyOtp(payload: {
    username: string;
    otp: string;
    codeChallenge: string;
    redirectUri: string;
  }): Observable<any> {
    return this._api.post(Auth_API.auth.verifyOtp, payload);
  }

  /** Step 3: exchange auth code → tokens */
  exchangeToken(payload: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
  }): Observable<any> {
    return this._api.post(Auth_API.auth.token, payload);
  }

  /** تجديد التوكن */
  refreshToken(): Observable<any> {
    const refresh = this.getRefreshToken();
    return this._api.post(Auth_API.auth.refreshToken, { refreshToken: refresh });
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

  // ==================================================================
  // ====================       TOKENS        =========================
  // ==================================================================

  /**
   * حفظ التوكنز — Access في memory + sessionStorage، Refresh في sessionStorage
   */
setTokens(accessToken: string, refreshToken?: string): void {
  this._accessToken.set(accessToken);

  // ★ خزّن بالمفتاح اللي الـ interceptor بيدور عليه
  this._storage.setStorage('token', accessToken);

  // ★ للتوافق مع اللي بيتوقع 'accessToken'
  this._storage.setSession('accessToken', accessToken);

  if (refreshToken) {
    this._storage.setStorage('refreshToken', refreshToken);
    this._storage.setSession('refreshToken', refreshToken);
  }

  console.log('💾 Token saved with keys: token + accessToken');
}

  /** Access Token — من الـ memory signal */
  getAccessToken(): string | null {
    return this._accessToken();
  }

  /** للتوافق مع الكود القديم */
  getToken(): string | null {
    return this._accessToken();
  }

  getRefreshToken(): string | null {
    return this._storage.getSession<string>('refreshToken');
  }
// في auth.service.ts

  hasToken(): boolean {
    return !!this._accessToken();
  }
/** Step 1: اطلب PKCE pair من الباك (GET) */

  /**
   * فك التوكن — آمن (بترجع null لو مفيش توكن أو التوكن تالف)
   */
  // getDecodedToken(): DecodedToken | null {
  //   const token = this._accessToken();
  //   if (!token) return null;
  //   try {
  //     return jwtDecode(token) as DecodedToken;
  //   } catch (e) {
  //     console.warn('[AuthService] Failed to decode token', e);
  //     return null;
  //   }
  // }

  // ==================================================================
  // ====================      PERMISSIONS    =========================
  // ==================================================================

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

  // ==================================================================
  // ====================       LOGOUT        =========================
  // ==================================================================

  logout(): void {
    // ★ امسح التوكنز من memory + sessionStorage
    this._accessToken.set(null);
    this._storage.removeSession('accessToken');
    this._storage.removeSession('refreshToken');

    // امسح الـ PKCE + credentials
    this.clearPkce();
    this.clearLoginCredentials();

    // امسح بيانات المستخدم (سيب اللغة + rememberedUser)
    this.user = null;
    this._storage.clear({ keepKeys: ['lang', 'rememberedUser'] });

    this._router.navigate(['/auth/login']);
  }
}