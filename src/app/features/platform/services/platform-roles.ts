import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/api/api-client.service';
import { PlatformRole, CreatePlatformRoleDto, UpdatePlatformRoleDto } from '../../../core/models/platform/platform-role.model';

@Injectable({ providedIn: 'root' })
export class PlatformRolesService {
  private readonly api = inject(ApiClientService);

  getAll(): Observable<PlatformRole[]> {
    return this.api.get<PlatformRole[]>('/platform/roles');
  }

  create(dto: CreatePlatformRoleDto): Observable<void> {
    return this.api.post<void>('/platform/roles', dto);
  }

  update(roleName: string, dto: UpdatePlatformRoleDto): Observable<void> {
    return this.api.put<void>(`/platform/roles/${encodeURIComponent(roleName)}`, dto);
  }

  delete(roleName: string): Observable<void> {
    return this.api.delete<void>(`/platform/roles/${roleName}`);
  }
}
