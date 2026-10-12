import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot,Resolve,RouterStateSnapshot} from '@angular/router';
import { Observable, catchError, of } from 'rxjs';
import { ApiService } from 'src/app/@core/api/api.service';
import { UnsubscribeService } from '../services/unsubscribe/unsubscribe.service';
import { PAGESIZE } from 'src/app/@core/utilities/defines';

@Injectable({
  providedIn: 'root',
})
export class DataResolverService implements Resolve<any> {
  constructor(
    private _apiService: ApiService,
    private _unsubscribe: UnsubscribeService
  ) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    const endpoint = route.data['endpoint']; 
    const id = route.paramMap.get('id');
    const param = {
      pageNum: 1,
      pagSize: PAGESIZE,
      orderByDirection: 'ASC',
      orderBy: 'mtrNo',
      [route.data['idKey']]: id,
    };

    return this._apiService.get(endpoint.get, param).pipe(
      catchError((error) => {
        //console.error('Data loading failed', error);
        return of(null);
      }),
      this._unsubscribe.takeUntilDestroy()
    );
  }
}
