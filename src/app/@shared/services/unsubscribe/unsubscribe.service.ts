import { Injectable } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UnsubscribeService {
  private  unsubscribeAll:Subject<void> = new Subject<void>()


  takeUntilDestroy<T>(): (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>): Observable<T> => source.pipe(takeUntil(this.unsubscribeAll));
  }

  destroy(): void {
      if (this.unsubscribeAll) {
        this.unsubscribeAll.next();
        this.unsubscribeAll.complete();
      }

  }
}
