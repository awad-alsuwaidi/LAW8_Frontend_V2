import { Injectable, signal, WritableSignal } from '@angular/core';
import { LookupJurisdictionsDto } from '../interfaces/lookup-jurisdictions';

@Injectable({
  providedIn: 'root'
})
export class LookupsJurisdictionsService {
  private lookupJurisdictionDetails: WritableSignal<LookupJurisdictionsDto |undefined> = signal<LookupJurisdictionsDto|undefined>(undefined);

  getLookupJurisdictionDetails() {
    return this.lookupJurisdictionDetails()
  }

  updatelookupJurisdictionDetails(value: LookupJurisdictionsDto) {
    this.lookupJurisdictionDetails.update(() => value);
  }
}
