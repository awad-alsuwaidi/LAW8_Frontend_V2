import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/api/api-client.service';
import { CountryDto, SaveCountryDto, PaginatedResult } from '../../../core/models/setup/setup.models';

@Injectable({ providedIn: 'root' })
export class CountriesService {
  private readonly api = inject(ApiClientService);

  getAll(regionId?: number): Observable<CountryDto[]> {
    const qs = regionId ? `?RegionId=${regionId}&PageSize=500` : '?PageSize=500';
    return this.api.get<PaginatedResult<CountryDto>>(`/countries${qs}`).pipe(
      map(r => r.items ?? [])
    );
  }

  getById(id: number): Observable<CountryDto> {
    return this.api.get<CountryDto>(`/countries/${id}`);
  }

  create(dto: SaveCountryDto): Observable<void> {
    return this.api.post<void>('/countries', dto);
  }

  update(id: number, dto: SaveCountryDto): Observable<void> {
    return this.api.put<void>(`/countries/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/countries/${id}`);
  }
}
