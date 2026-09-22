/** Platform role as served by Tenancy (`/platform/roles`): identity from Auth, grant count from Tenancy. */
export interface PlatformRole {
  id: string;
  name: string;
  nameAr?: string | null;
  isSystemRole: boolean;
  grantCount: number;
}

export interface CreatePlatformRoleDto {
  name: string;
  nameAr?: string | null;
}

export type UpdatePlatformRoleDto = CreatePlatformRoleDto;
