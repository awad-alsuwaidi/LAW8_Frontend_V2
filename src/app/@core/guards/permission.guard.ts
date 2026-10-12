import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { LanguageService, ToastrNotifiService } from '@core/services';
import { PermissionService } from '@core/services/permission.service';
import { PermissionAction } from '@core/models/permission.interface';

/**
 * ★ أشكال الـ permission المدعومة في الـ route data:
 *
 *   1) string القديم:
 *      data: { permission: 'View_MatterCategory' }
 *
 *   2) object الجديد:
 *      data: { permission: { routeName: 'MatterCategories', action: 'canRead' } }
 *
 *   3) أي واحدة من مجموعة (anyOf):
 *      data: { permission: { anyOf: [
 *        { routeName: 'MatterStatuses', action: 'canRead' },
 *        { routeName: 'MatterStages',   action: 'canRead' },
 *      ] } }
 *
 *   4) كل المجموعة (allOf):
 *      data: { permission: { allOf: [
 *        { routeName: 'Clients', action: 'canUpdate' },
 *        { routeName: 'Clients', action: 'canDelete' },
 *      ] } }
 */
export type PermissionData =
  | string
  | {
      routeName?: string;
      action?: PermissionAction;
      anyOf?: Array<{ routeName: string; action?: PermissionAction }>;
      allOf?: Array<{ routeName: string; action?: PermissionAction }>;
    };

/** ★ يبحث في route والـ parents عن data.permission */
function getRequiredPermission(
  route: ActivatedRouteSnapshot
): PermissionData | null {
  let r: ActivatedRouteSnapshot | null = route;
  while (r) {
    const p = r.data?.['permission'];
    if (p) return p as PermissionData;
    r = r.parent;
  }
  return null;
}

/** ★ الفحص الأساسي — يدعم كل الأشكال */
function checkPermission(
  perm: PermissionData | null,
  permissionService: PermissionService
): boolean {
  if (!perm) return true; // مفيش صلاحية مطلوبة → افتح

  // الشكل 1: string قديم
  if (typeof perm === 'string') {
    return permissionService.hasPermission(perm);
  }

  // الشكل 3: anyOf
  if (perm.anyOf?.length) {
    return perm.anyOf.some((c) =>
      permissionService.hasPermission(c.routeName, c.action ?? 'canRead')
    );
  }

  // الشكل 4: allOf
  if (perm.allOf?.length) {
    return perm.allOf.every((c) =>
      permissionService.hasPermission(c.routeName, c.action ?? 'canRead')
    );
  }

  // الشكل 2: object عادي
  if (perm.routeName) {
    return permissionService.hasPermission(
      perm.routeName,
      perm.action ?? 'canRead'
    );
  }

  // data.permission موجود بس فاضي → افتح
  return true;
}

export const permissionGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const _router = inject(Router);
  const _permissionService = inject(PermissionService);
  const _toastrNotifiService = inject(ToastrNotifiService);
  const _languageService = inject(LanguageService);

  const requiredPermission = getRequiredPermission(next);

  const allowed = checkPermission(requiredPermission, _permissionService);

  if (!allowed) {
    console.warn('🚫 Access denied:', requiredPermission, '| URL:', state.url);

    _toastrNotifiService.displayError(
      _languageService.getTransValue('matters.yyouDontHavePermission')
    );

    return _router.parseUrl('/dashboard');
  }

  return true;
};