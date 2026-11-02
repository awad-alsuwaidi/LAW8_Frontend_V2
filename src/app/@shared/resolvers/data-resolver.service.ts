import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, catchError, of } from 'rxjs';
import { ApiService } from 'src/app/@core/api/api.service';
import { UnsubscribeService } from '../services/unsubscribe/unsubscribe.service';
import { PAGESIZE } from 'src/app/@core/utilities/defines';

const V2_ID_KEYS = [
  'relatedToMatterId',
  'matterId',
  'clientId',
  'practiceAreaId',
  'matterCategoryId',
  'matterTypeId',
  'statusId',
  'branchId',
  'stageId',
  'jurisdictionId',
];

@Injectable({
  providedIn: 'root',
})
export class DataResolverService implements Resolve<any> {
  constructor(
    private _apiService: ApiService,
    private _unsubscribe: UnsubscribeService,
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<any> {
    const endpoint = route.data['endpoint'];
    const id = route.paramMap.get('id');
    const idKey = route.data['idKey'];

    const isInactiveRoute = state.url.includes('inactive');
    const isActive = !isInactiveRoute;

    const useV2 = !!idKey && V2_ID_KEYS.includes(idKey);
    const param = useV2
      ? this.buildV2Params(idKey, id, isActive)
      : this.buildLegacyParams(idKey, id, isActive);

    return this._apiService.get(endpoint.get, param).pipe(
      catchError((error) => of(null)),
      this._unsubscribe.takeUntilDestroy(),
    );
  }

  private buildV2Params(
    idKey: string,
    id: string | null,
    isActive: boolean,
  ): any {
    const params: any = {
      pageNumber: 1,
      pageSize: PAGESIZE,
      searchTerm: '',
      isActive: isActive,
    };
    if (id) {
      params[`filters[${idKey}]`] = id;
    }
    return params;
  }

  private buildLegacyParams(
    idKey: string,
    id: string | null,
    isActive: boolean,
  ): any {
    const params: any = {
      pageNumber: 1,
      pageSize: PAGESIZE,
      orderByDirection: 'ASC',
      orderBy: 'mtrNo',
      isActive: isActive,
    };
    if (id) {
      params[idKey] = id;
    }
    return params;
  }
}
