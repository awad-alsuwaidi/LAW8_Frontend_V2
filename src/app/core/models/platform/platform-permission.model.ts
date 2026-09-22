/** Tenancy_Permissions catalog row - one per protected route on the platform console (Tenancy service). */
export interface PlatformPermission {
  id: number;
  routeName: string;
  nameEn: string;
  nameAr?: string | null;
  isActive: boolean;
  /** Console section key resolved by the backend (tenants | masterData | security | platform). */
  group: PermissionGroupKey;
}

export type PermissionGroupKey = 'tenants' | 'masterData' | 'security' | 'platform';

export interface RolePermissionGrant {
  permissionId: number;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canSearch: boolean;
  canPrint: boolean;
  canExport: boolean;
}

export interface SaveRolePermissionsDto {
  /** Auth ApplicationRole.Id - hybrid Id-first; grants saved with it survive a role rename. */
  roleId?: string | null;
  roleName: string;
  grants: RolePermissionGrant[];
}

export interface PatchRolePermissionDto {
  roleId?: string | null;
  canRead?: boolean | null;
  canUpdate?: boolean | null;
  canDelete?: boolean | null;
  canSearch?: boolean | null;
  canPrint?: boolean | null;
  canExport?: boolean | null;
}
