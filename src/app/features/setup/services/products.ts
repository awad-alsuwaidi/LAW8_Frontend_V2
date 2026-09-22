import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/api/api-client.service';
import { ProductDto, SaveProductDto, PaginatedResult } from '../../../core/models/setup/setup.models';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly api = inject(ApiClientService);

  getAll(): Observable<ProductDto[]> {
    return this.api.get<PaginatedResult<ProductDto>>('/products?PageSize=500').pipe(
      map(r => r.items ?? [])
    );
  }

  getById(id: number): Observable<ProductDto> {
    return this.api.get<ProductDto>(`/products/${id}`);
  }

  create(dto: SaveProductDto): Observable<void> {
    return this.api.post<void>('/products', dto);
  }

  update(id: number, dto: SaveProductDto): Observable<void> {
    return this.api.put<void>(`/products/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/products/${id}`);
  }
}
