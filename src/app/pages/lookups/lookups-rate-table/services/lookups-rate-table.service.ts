import { Injectable, signal, WritableSignal } from '@angular/core';
import { Subject } from 'rxjs';
import { RateTableDto } from '../interfaces/rate-table.interface';

@Injectable({
  providedIn: 'root'
})
export class LookupsRateTableService {

  private lookupRateDetails: WritableSignal<RateTableDto | undefined> =
    signal<RateTableDto | undefined>(undefined);

  refreshRateTypeList$ = new Subject<void>();

  getLookupRateDetails() {
    return this.lookupRateDetails();
  }

  updateLookupRateDetails(value: RateTableDto) {
    this.lookupRateDetails.update(() => value);
  }

  triggerRefreshRateTypeList() {
    this.refreshRateTypeList$.next();
  }
}