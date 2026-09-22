import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/api/api-client.service';
import { CurrencyDto, SaveCurrencyDto, PaginatedResult } from '../../../core/models/setup/setup.models';

@Injectable({ providedIn: 'root' })
export class CurrenciesService {
  private readonly api = inject(ApiClientService);

  getAll(): Observable<CurrencyDto[]> {
    return this.api.get<PaginatedResult<CurrencyDto>>('/currencies?PageSize=500').pipe(
      map(r => r.items ?? [])
    );
  }

  getById(id: number): Observable<CurrencyDto> {
    return this.api.get<CurrencyDto>(`/currencies/${id}`);
  }

  create(dto: SaveCurrencyDto): Observable<void> {
    return this.api.post<void>('/currencies', dto);
  }

  update(id: number, dto: SaveCurrencyDto): Observable<void> {
    return this.api.put<void>(`/currencies/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/currencies/${id}`);
  }
}
