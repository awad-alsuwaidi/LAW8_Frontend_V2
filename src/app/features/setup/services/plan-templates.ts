import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/api/api-client.service';
import { PlanTemplateDto, SavePlanTemplateDto } from '../../../core/models/platform-ops/platform-ops.models';

@Injectable({ providedIn: 'root' })
export class PlanTemplatesService {
  private readonly api = inject(ApiClientService);

  getAll(productId?: number, activeOnly = false): Observable<PlanTemplateDto[]> {
    const q = new URLSearchParams();
    if (productId) q.set('productId', String(productId));
    if (activeOnly) q.set('activeOnly', 'true');
    const qs = q.toString();
    return this.api.get<PlanTemplateDto[]>(`/plantemplates${qs ? '?' + qs : ''}`);
  }

  create(dto: SavePlanTemplateDto): Observable<PlanTemplateDto> {
    return this.api.post<PlanTemplateDto>('/plantemplates', dto);
  }

  update(id: number, dto: SavePlanTemplateDto): Observable<PlanTemplateDto> {
    return this.api.put<PlanTemplateDto>(`/plantemplates/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/plantemplates/${id}`);
  }
}
