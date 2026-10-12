import { Injectable, inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private requestCount = 0;

  _spinner = inject(NgxSpinnerService);


  show(): void {
    this.requestCount++;
    if (this.requestCount === 1) {
      this._spinner.show();
    }
  }

  hide(): void {
    this.requestCount--;
    if (this.requestCount === 0) {
      this._spinner.hide();
    }
  }
}
