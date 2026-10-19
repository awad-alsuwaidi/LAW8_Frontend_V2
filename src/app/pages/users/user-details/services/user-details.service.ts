import { Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ApiService } from 'src/app/@core/api/api.service';
import { API_Config } from 'src/app/@core/api/api-config/api.config';

@Injectable({
  providedIn: 'root'
})
export class UserDetailsService {
  private userData: WritableSignal<any> = signal<any>({} as any);
  
  private userRequests = new Map<string, Observable<any>>();
  constructor(private _apiService: ApiService) {}

  getUserData() {
    return this.userData();
  }

  updateUserData(value: any) {
    this.userData.update(() => value);
  }

  getUserById(id: string, forceRefresh = false): Observable<any> {
    if (forceRefresh || !this.userRequests.has(id)) {
      const request$ = this._apiService
        .get(`${API_Config.users.getById}/${id}`)
        .pipe(
          shareReplay(1) 
        );
      
      this.userRequests.set(id, request$);
    }
    
    return this.userRequests.get(id)!;
  }
}