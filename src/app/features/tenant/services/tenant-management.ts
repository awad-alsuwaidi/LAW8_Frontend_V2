import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/api/api-client.service';
import { PaginatedResult } from '../../../core/models/setup/setup.models';
import { ORGANIZATION_ENDPOINTS } from '../../../core/api/endpoints/organizations.endpoints';
import { Organization, OrganizationApiDto, toOrganization } from '../../../core/models/organizations/organization.model';
import { OrganizationAttachment } from '../../../core/models/organizations/organization-attachment.model';
import { RegisterOrganizationRequest, SubscriptionRequest } from '../../../core/models/organizations/register-organization.request';
import { UpdateOrganizationRequest } from '../../../core/models/organizations/update-organization.request';
import { ProvisioningStatus } from '../../../core/models/organizations/provisioning-status.model';
export type { SubscriptionRequest };

@Injectable({ providedIn: 'root' })
export class TenantManagement {
  private readonly api = inject(ApiClientService);

  getAll(params?: { status?: string; productCode?: string }): Observable<Organization[]> {
    const qs = new URLSearchParams({ pageSize: '500' });
    if (params?.status) qs.set('status', params.status);
    if (params?.productCode) qs.set('productCode', params.productCode);
    return this.api
      .get<PaginatedResult<OrganizationApiDto>>(`${ORGANIZATION_ENDPOINTS.getAll}?${qs.toString()}`)
      .pipe(map((r) => (r.items ?? []).map(toOrganization)));
  }

  getById(id: string): Observable<Organization> {
    return this.api.get<OrganizationApiDto>(ORGANIZATION_ENDPOINTS.getById(id)).pipe(map(toOrganization));
  }

  register(payload: RegisterOrganizationRequest): Observable<Organization> {
    return this.api.post<OrganizationApiDto>(ORGANIZATION_ENDPOINTS.create, payload).pipe(map(toOrganization));
  }

  addSubscription(orgId: string, payload: SubscriptionRequest): Observable<void> {
    return this.api.post<void>(`/organizations/${orgId}/subscriptions`, payload);
  }

  update(id: string, payload: UpdateOrganizationRequest): Observable<void> {
    return this.api.put<void>(ORGANIZATION_ENDPOINTS.update(id), payload);
  }

  resetAdminPassword(id: string): Observable<string> {
    return this.api.post<string>(ORGANIZATION_ENDPOINTS.resetAdminPassword(id), {});
  }

  uploadLogo(id: string, file: File): Observable<void> {
    const fd = new FormData();
    fd.append('file', file);
    return this.api.postMultipart<void>(ORGANIZATION_ENDPOINTS.uploadLogo(id), fd);
  }

  updateNotes(id: string, notes: string): Observable<void> {
    return this.api.put<void>(ORGANIZATION_ENDPOINTS.updateNotes(id), { notes });
  }

  getProvisioningStatus(id: string): Observable<ProvisioningStatus> {
    return this.api.get<ProvisioningStatus>(ORGANIZATION_ENDPOINTS.provisioningStatus(id));
  }

  getAttachments(orgId: string): Observable<OrganizationAttachment[]> {
    return this.api.get<OrganizationAttachment[]>(ORGANIZATION_ENDPOINTS.attachments(orgId));
  }

  uploadAttachment(orgId: string, file: File, documentType: string): Observable<void> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('attachmentType', documentType);
    return this.api.postMultipart<void>(ORGANIZATION_ENDPOINTS.attachments(orgId), fd);
  }

  deleteAttachment(orgId: string, attachmentId: string): Observable<void> {
    return this.api.delete<void>(
      ORGANIZATION_ENDPOINTS.attachmentById(orgId, attachmentId)
    );
  }

  /** The download endpoint needs the bearer token, so it goes through the API client (a plain link would 401). */
  downloadAttachment(orgId: string, attachmentId: string): Observable<Blob> {
    return this.api.getBlob(ORGANIZATION_ENDPOINTS.downloadAttachment(orgId, attachmentId));
  }

  retryProvisioning(id: string): Observable<void> {
    return this.api.post<void>(ORGANIZATION_ENDPOINTS.retryProvisioning(id), {});
  }

  exportCsv(): Observable<Blob> {
    return this.api.getBlob('/export/organizations');
  }
}
