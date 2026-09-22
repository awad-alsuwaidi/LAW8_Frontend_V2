import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/api/api-client.service';
import { PaginatedResult } from '../../../core/models/setup/setup.models';
import {
  PlatformUser,
  CreatePlatformUserDto,
  UpdatePlatformUserDto,
} from '../../../core/models/platform/platform-user.model';

@Injectable({ providedIn: 'root' })
export class PlatformUsersService {
  private readonly api = inject(ApiClientService);

  getAll(): Observable<PlatformUser[]> {
    return this.api
      .get<PaginatedResult<PlatformUser>>('/platform/users?pageSize=500')
      .pipe(map((r) => r.items ?? []));
  }

  getById(id: string): Observable<PlatformUser> {
    return this.api.get<PlatformUser>(`/platform/users/${id}`);
  }

  create(payload: CreatePlatformUserDto): Observable<PlatformUser> {
    return this.api.post<PlatformUser>('/platform/users', payload);
  }

  update(id: string, payload: UpdatePlatformUserDto): Observable<void> {
    return this.api.put<void>(`/platform/users/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/platform/users/${id}`);
  }

  assignRole(id: string, roleName: string): Observable<void> {
    return this.api.post<void>(`/platform/users/${id}/roles`, { roleName });
  }

  removeRole(id: string, roleName: string): Observable<void> {
    return this.api.delete<void>(`/platform/users/${id}/roles/${roleName}`);
  }
}
