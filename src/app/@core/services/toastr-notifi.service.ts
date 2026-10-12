import { Injectable, Injector, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LanguageService } from './language.service';

@Injectable({ providedIn: 'root' })
export class ToastrNotifiService {

  toastr: ToastrService = inject(ToastrService);
  _languageService = inject(LanguageService);


  displaySuccess(message: string) {
    if (this.toastr) {
      if (this.toastr.currentlyActive) {
        this.toastr.clear();
      }
      const positionClass = 'toast-top-center';
      this.toastr.success(message, undefined, {
        timeOut: 2500,
        extendedTimeOut: 2500,
        positionClass,
        closeButton:true
      });
    }
  }

  displayError(message: string) {
    if (this.toastr) {
      if (this.toastr.currentlyActive) {
        this.toastr.clear();
      }
      const positionClass = 'toast-top-center';
      this.toastr.error(message, undefined, {
        timeOut: 2500,
        extendedTimeOut: 2500,
        positionClass,
      });
    }
  }
}
