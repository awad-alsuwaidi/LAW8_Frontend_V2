import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/api/api-client.service';
import {
  PaginatedResult,
  SubscriptionDetailDto,
  SubscriptionHistoryDto,
  SuspendSubscriptionDto,
  CancelSubscriptionDto,
  AddUsersDto,
} from '../../../core/models/subscription/subscription.models';

@Injectable({ providedIn: 'root' })
export class SubscriptionsService {
  private readonly api = inject(ApiClientService);

  getAll(): Observable<SubscriptionDetailDto[]> {
    return this.api
      .get<PaginatedResult<SubscriptionDetailDto>>('/subscriptions?PageSize=500')
      .pipe(map((r) => r.items ?? []));
  }

  getById(id: string): Observable<SubscriptionDetailDto> {
    return this.api.get<SubscriptionDetailDto>(`/subscriptions/${id}`);
  }

  getHistory(id: string): Observable<SubscriptionHistoryDto[]> {
    return this.api.get<SubscriptionHistoryDto[]>(`/subscriptions/${id}/history`);
  }

  suspend(id: string, dto: SuspendSubscriptionDto): Observable<SubscriptionDetailDto> {
    return this.api.patch<SubscriptionDetailDto>(`/subscriptions/${id}/suspend`, dto);
  }

  reactivate(id: string): Observable<SubscriptionDetailDto> {
    return this.api.patch<SubscriptionDetailDto>(`/subscriptions/${id}/reactivate`, {});
  }

  addUsers(id: string, dto: AddUsersDto): Observable<SubscriptionDetailDto> {
    return this.api.patch<SubscriptionDetailDto>(`/subscriptions/${id}/add-users`, dto);
  }

  cancel(id: string, dto: CancelSubscriptionDto): Observable<SubscriptionDetailDto> {
    return this.api.patch<SubscriptionDetailDto>(`/subscriptions/${id}/cancel`, dto);
  }

  getByOrganization(organizationId: string): Observable<SubscriptionDetailDto[]> {
    return this.api
      .get<SubscriptionDetailDto[] | PaginatedResult<SubscriptionDetailDto>>(`/subscriptions/by-organization/${organizationId}`)
      .pipe(map((r) => (Array.isArray(r) ? r : r?.items ?? [])));
  }
}
