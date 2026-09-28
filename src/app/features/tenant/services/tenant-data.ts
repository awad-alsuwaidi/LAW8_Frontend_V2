import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/api/api-client.service';
import {
  DataDeletionCertificateDto,
  OrganizationStorageUsageDto,
  TenantExportDto,
} from '../../../core/models/platform-ops/platform-ops.models';

/** Storage usage, exports (exit plan) and deletion certificates of one organization. */
@Injectable({ providedIn: 'root' })
export class TenantDataService {
  private readonly api = inject(ApiClientService);

  getStorageUsage(orgId: string): Observable<OrganizationStorageUsageDto> {
    return this.api.get<OrganizationStorageUsageDto>(`/organizations/${orgId}/storage-usage`);
  }

  refreshStorageUsage(orgId: string): Observable<OrganizationStorageUsageDto> {
    return this.api.post<OrganizationStorageUsageDto>(`/organizations/${orgId}/storage-usage/refresh`, {});
  }

  getExports(orgId: string): Observable<TenantExportDto[]> {
    return this.api.get<TenantExportDto[]>(`/organizations/${orgId}/exports`);
  }

  getExport(orgId: string, exportId: string): Observable<TenantExportDto> {
    return this.api.get<TenantExportDto>(`/organizations/${orgId}/exports/${exportId}`);
  }

  startExport(orgId: string, includeAllVersions: boolean): Observable<TenantExportDto> {
    return this.api.post<TenantExportDto>(`/organizations/${orgId}/exports`, { includeAllVersions });
  }

  /** Local-disk fallback (no signed link): the package streams through the API with the bearer token. */
  downloadExportPart(orgId: string, exportId: string, product: string): Observable<Blob> {
    return this.api.getBlob(`/organizations/${orgId}/exports/${exportId}/download/${product}`);
  }

  getDeletionCertificates(orgId: string): Observable<DataDeletionCertificateDto[]> {
    return this.api.get<DataDeletionCertificateDto[]>(`/organizations/${orgId}/deletion-certificates`);
  }
}
