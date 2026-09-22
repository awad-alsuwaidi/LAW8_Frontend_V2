import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/api/api-client.service';
import { PaginatedResult } from '../../../core/models/setup/setup.models';

export type AuditActionType = 'Created' | 'Updated' | 'Deleted';

export interface AuditLogDto {
  id: string;
  entityName: string;
  entityId: string;
  action: AuditActionType;
  changes?: string;
  changedBy?: string;
  changedAtUtc: string;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly api = inject(ApiClientService);

  getAll(entityName?: string): Observable<AuditLogDto[]> {
    const entityParam = entityName ? `&entityName=${encodeURIComponent(entityName)}` : '';
    return this.api
      .get<PaginatedResult<AuditLogDto>>(`/auditlogs?pageSize=100${entityParam}`)
      .pipe(map((r) => r.items ?? []));
  }

  getByEntity(entityName: string, entityId: string): Observable<AuditLogDto[]> {
    return this.api.get<AuditLogDto[]>(`/auditlogs/by-entity/${encodeURIComponent(entityName)}/${encodeURIComponent(entityId)}`);
  }
}
