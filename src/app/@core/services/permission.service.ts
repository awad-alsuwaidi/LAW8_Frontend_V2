import { Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  MeResponse,
  PermissionAction,
  UserCapabilities,
  UserPermission,
} from '../models/permission.interface';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private _authService = inject(AuthService);

  // ==================== New State (from /me) ====================
  private _permissions = signal<UserPermission[]>([]);
  private _capabilities = signal<UserCapabilities | null>(null);
  private _isAdmin = signal<boolean>(false);
  private _dashboards = signal<string[]>([]);

  /** ★ Legacy state — عشان الكود القديم اللي بيستخدم getUserPermissions() */
  private refreshUserPermissions: WritableSignal<string[]> = signal<string[]>([]);
  permissions$ = new BehaviorSubject<string[]>([]);

  // ==================== Public Getters ====================
  readonly isAdmin = computed(() => this._isAdmin());
  readonly capabilities = computed(() => this._capabilities());
  readonly dashboards = computed(() => this._dashboards());

  constructor() {
    // ★ ما فيش اعتماد على getDecodedToken هنا خلاص
    // بيانات اليوزر بتتحمّل من /me بعد اللوجين
    if (this._authService.hasToken()) {
      const cached = this._authService.user;
      if (cached?.permissions) {
        // لو اليوزر مخزّن من قبل (refresh)، استرجع الصلاحيات
        this.loadFromMe(cached as MeResponse);
      }
    }
  }

  // ==================== Loading from /me ====================

  /**
   * ★ استدعها بعد نجاح اللوجين أو عند refresh بـ /me response
   */
  loadFromMe(me: MeResponse): void {
    this._isAdmin.set(!!me?.isAdmin);
    this._permissions.set(me?.permissions ?? []);
    this._capabilities.set(me?.capabilities ?? null);
    this._dashboards.set(me?.dashboards ?? []);

    // ★ كمان نبني الـ legacy array عشان الكود القديم يفضل شغال
    const legacy = this.buildLegacyPermissionStrings(me);
    this.refreshUserPermissions.set(legacy);
    this.permissions$.next(legacy);
  }

  /**
   * ★ بتحوّل permissions الجديدة إلى الشكل القديم 'Add_X', 'View_X' ...
   * عشان الكود القديم اللي فيه hasPermission('Add_MatterStatus') يفضل شغال.
   */
  private buildLegacyPermissionStrings(me: MeResponse): string[] {
    if (!me?.permissions) return [];
    const out: string[] = [];

    for (const p of me.permissions) {
      const route = p.routeName;
      if (p.canRead) out.push(`View_${route}`);
      if (p.canUpdate) out.push(`Update_${route}`);
      if (p.canDelete) out.push(`Delete_${route}`);
      // ★ لو عندك actions تانية استخدمها
      if ((p as any).canAdd) out.push(`Add_${route}`);
    }

    return out;
  }

  clear(): void {
    this._isAdmin.set(false);
    this._permissions.set([]);
    this._capabilities.set(null);
    this._dashboards.set([]);
    this.refreshUserPermissions.set([]);
    this.permissions$.next([]);
  }

  // ==================== hasPermission — overloaded ====================

  /**
   * ★ overloaded:
   *   hasPermission('Add_MatterStatus')            ← القديم
   *   hasPermission('MatterStatuses')              ← الجديد (canRead default)
   *   hasPermission('MatterStatuses', 'canUpdate') ← الجديد
   */
  hasPermission(permissionOrRoute: string, action: PermissionAction = 'canRead'): boolean {
    // Admin bypass
    if (this._isAdmin()) return true;
    if (!permissionOrRoute) return false;

    // ★ لو الشكل القديم (فيه underscore وبادئة معروفة) → استخدم الـ legacy array
    if (this.isLegacyPermission(permissionOrRoute)) {
      return this.refreshUserPermissions().some((v) => v === permissionOrRoute);
    }

    // ★ الشكل الجديد: routeName + action
    const perm = this._permissions().find(
      (p) => p.routeName?.toLowerCase() === permissionOrRoute.toLowerCase()
    );
    return !!perm?.[action];
  }

  /** بيحدد لو الـ string شكله legacy ('Add_X', 'View_X', 'Update_X'...) */
  private isLegacyPermission(value: string): boolean {
    return /^(Add|Update|Delete|View|Print|Export|Search)_/.test(value);
  }

  /** ★ نفس اللي فوق بس بياخد array (للتوافق مع الكود القديم اللي بياخد array) */
  hasAnyPermission(checks: string[]): boolean {
    return checks.some((c) => this.hasPermission(c));
  }

  hasAllPermissions(checks: string[]): boolean {
    return checks.every((c) => this.hasPermission(c));
  }

  // ==================== Capabilities ====================

  hasCapability(key: keyof UserCapabilities): boolean {
    if (this._isAdmin()) return true;
    return !!this._capabilities()?.[key];
  }

  // ==================== Legacy getters ====================

  getUserPermissions() {
    return this.refreshUserPermissions();
  }

  /** ★ بتفضل موجودة للتوافق، بس مش محتاج تستدعيها لأن loadFromMe بتعمل كل حاجة */
  updateUserPermissions(value: string[] | any): void {
    if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
      this.refreshUserPermissions.update(() => value);
      this.permissions$.next(value);
    }
    // لو بعت MeResponse، ناد loadFromMe بدالها
  }
}