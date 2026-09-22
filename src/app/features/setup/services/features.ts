import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/api/api-client.service';
import { FeatureDto, SaveFeatureDto, PaginatedResult } from '../../../core/models/setup/setup.models';

@Injectable({ providedIn: 'root' })
export class FeaturesService {
  private readonly api = inject(ApiClientService);

  getByProduct(productId: number): Observable<FeatureDto[]> {
    return this.api.get<PaginatedResult<FeatureDto>>(`/features/by-product/${productId}?PageSize=500`).pipe(
      map(r => r.items ?? [])
    );
  }

  getById(id: number): Observable<FeatureDto> {
    return this.api.get<FeatureDto>(`/features/${id}`);
  }

  create(dto: SaveFeatureDto): Observable<void> {
    return this.api.post<void>('/features', dto);
  }

  update(id: number, dto: SaveFeatureDto): Observable<void> {
    return this.api.put<void>(`/features/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/features/${id}`);
  }
}
