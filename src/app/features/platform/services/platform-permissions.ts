import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/api/api-client.service';
import {
  PlatformPermission,
  RolePermissionGrant,
  SaveRolePermissionsDto,
  PatchRolePermissionDto,
} from '../../../core/models/platform/platform-permission.model';

@Injectable({ providedIn: 'root' })
export class PlatformPermissionsService {
  private readonly api = inject(ApiClientService);

  getAll(): Observable<PlatformPermission[]> {
    return this.api.get<PlatformPermission[]>('/platform/permissions');
  }

  getByRole(roleName: string): Observable<RolePermissionGrant[]> {
    return this.api.get<RolePermissionGrant[]>(`/platform/permissions/by-role/${roleName}`);
  }

  saveGrants(dto: SaveRolePermissionsDto): Observable<void> {
    return this.api.put<void>('/platform/permissions', dto);
  }

  upsertGrant(roleName: string, permissionId: number, dto: RolePermissionGrant): Observable<void> {
    return this.api.put<void>(`/platform/permissions/by-role/${roleName}/${permissionId}`, dto);
  }

  patchGrant(roleName: string, permissionId: number, dto: PatchRolePermissionDto): Observable<void> {
    return this.api.patch<void>(`/platform/permissions/by-role/${roleName}/${permissionId}`, dto);
  }

  deleteGrant(roleName: string, permissionId: number): Observable<void> {
    return this.api.delete<void>(`/platform/permissions/by-role/${roleName}/${permissionId}`);
  }
}
