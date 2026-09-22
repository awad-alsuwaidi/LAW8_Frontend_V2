import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/api/api-client.service';

@Injectable({ providedIn: 'root' })
export class SelfServiceApiService {
  private readonly api = inject(ApiClientService);

  sendPasswordReset(email: string): Observable<any> {
    return this.api.forgotPassword(email);
  }
}
