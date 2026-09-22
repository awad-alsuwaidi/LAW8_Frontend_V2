import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/api/api-client.service';
import { PaginatedResult } from '../../../core/models/setup/setup.models';
import {
  LicenseKeySummaryDto,
  LicenseKeyDetailsDto,
  CreateLicenseKeyDto,
  ReleaseActivationDto,
} from '../../../core/models/licensing/license-key.model';

@Injectable({ providedIn: 'root' })
export class LicensingService {
  private readonly api = inject(ApiClientService);

  getAll(): Observable<LicenseKeySummaryDto[]> {
    return this.api
      .get<PaginatedResult<LicenseKeySummaryDto>>('/licensing/keys?PageSize=500')
      .pipe(map((r) => r.items ?? []));
  }

  getById(id: string): Observable<LicenseKeyDetailsDto> {
    return this.api.get<LicenseKeyDetailsDto>(`/licensing/keys/${id}`);
  }

  getByTenant(tenantId: string): Observable<LicenseKeySummaryDto[]> {
    return this.api
      .get<PaginatedResult<LicenseKeySummaryDto>>(`/licensing/keys/by-tenant/${tenantId}`)
      .pipe(map((r) => r.items ?? []));
  }

  create(dto: CreateLicenseKeyDto): Observable<LicenseKeyDetailsDto> {
    return this.api.post<LicenseKeyDetailsDto>('/licensing/keys', dto);
  }

  cancel(id: string): Observable<void> {
    return this.api.post<void>(`/licensing/keys/${id}/cancel`, {});
  }

  releaseActivation(activationId: string, dto: ReleaseActivationDto): Observable<void> {
    return this.api.post<void>(`/licensing/activations/${activationId}/release`, dto);
  }
}
