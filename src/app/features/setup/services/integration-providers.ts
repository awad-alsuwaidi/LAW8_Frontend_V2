import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/api/api-client.service';
import { IntegrationProviderDto, SaveIntegrationProviderDto } from '../../../core/models/platform-ops/platform-ops.models';

@Injectable({ providedIn: 'root' })
export class IntegrationProvidersService {
  private readonly api = inject(ApiClientService);

  getAll(): Observable<IntegrationProviderDto[]> {
    return this.api.get<IntegrationProviderDto[]>('/integrationproviders');
  }

  create(dto: SaveIntegrationProviderDto): Observable<IntegrationProviderDto> {
    return this.api.post<IntegrationProviderDto>('/integrationproviders', dto);
  }

  update(id: number, dto: SaveIntegrationProviderDto): Observable<IntegrationProviderDto> {
    return this.api.put<IntegrationProviderDto>(`/integrationproviders/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/integrationproviders/${id}`);
  }
}
