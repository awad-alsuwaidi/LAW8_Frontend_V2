import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubdomainService {

  // 🔥 مؤقت لحد الباك يشتغل
  private validSubdomains = ['oman', 'uae', 'demo'];

  getSubdomain(): string {
    const host = window.location.hostname;

    if (host.includes('localhost')) return 'localhost';

    return host.split('.')[0];
  }

  validate(sub: string): Observable<boolean> {
    if (this.validSubdomains.includes(sub)) {
      return of(true);
    }

    return throwError(() => new Error('Invalid subdomain'));



    // ✅ لما الباك يجهز بدل ده:
    // return this.http.get(`/api/subdomain/${sub}`);
  }
}