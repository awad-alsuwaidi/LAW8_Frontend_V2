import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/api/api-client.service';
import { OrgTypeDto, SaveOrgTypeDto, PaginatedResult } from '../../../core/models/setup/setup.models';

@Injectable({ providedIn: 'root' })
export class OrgTypesService {
  private readonly api = inject(ApiClientService);

  getAll(): Observable<OrgTypeDto[]> {
    return this.api.get<PaginatedResult<OrgTypeDto>>('/organizationtypes?PageSize=500').pipe(
      map(r => r.items ?? [])
    );
  }

  getById(id: number): Observable<OrgTypeDto> {
    return this.api.get<OrgTypeDto>(`/organizationtypes/${id}`);
  }

  create(dto: SaveOrgTypeDto): Observable<void> {
    return this.api.post<void>('/organizationtypes', dto);
  }

  update(id: number, dto: SaveOrgTypeDto): Observable<void> {
    return this.api.put<void>(`/organizationtypes/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/organizationtypes/${id}`);
  }
}
