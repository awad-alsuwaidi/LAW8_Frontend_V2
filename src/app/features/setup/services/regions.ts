import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/api/api-client.service';
import { RegionDto, SaveRegionDto, PaginatedResult } from '../../../core/models/setup/setup.models';

@Injectable({ providedIn: 'root' })
export class RegionsService {
  private readonly api = inject(ApiClientService);

  getAll(): Observable<RegionDto[]> {
    return this.api.get<PaginatedResult<RegionDto>>('/regions?PageSize=500').pipe(
      map(r => r.items ?? [])
    );
  }

  getById(id: number): Observable<RegionDto> {
    return this.api.get<RegionDto>(`/regions/${id}`);
  }

  create(dto: SaveRegionDto): Observable<void> {
    return this.api.post<void>('/regions', dto);
  }

  update(id: number, dto: SaveRegionDto): Observable<void> {
    return this.api.put<void>(`/regions/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/regions/${id}`);
  }
}
