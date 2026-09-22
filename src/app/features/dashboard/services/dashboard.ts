import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/api/api-client.service';
import { DashboardSummary } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private api: ApiClientService) {}

  getSummary(): Observable<DashboardSummary> {
    return this.api.get<DashboardSummary>('/Dashboard/summary');
  }
}
