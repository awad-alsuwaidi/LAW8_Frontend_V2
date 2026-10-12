import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { LookupCategoryDto } from '../interfaces/lookup-category.interface';

@Injectable({ providedIn: 'root' })
export class LookupsCategoriesService {
  private _details = signal<LookupCategoryDto | undefined>(undefined);
  private _refresh$ = new Subject<void>();

  refresh$ = this._refresh$.asObservable();

  getLookupCategoryDetails() {
    return this._details();
  }

  setLookupCategoryDetails(value: LookupCategoryDto | undefined) {
    this._details.set(value);
  }

  updateLookupCategoryDetails(value: LookupCategoryDto | undefined) {
    this._details.set(value);
    this._refresh$.next();
  }
}
