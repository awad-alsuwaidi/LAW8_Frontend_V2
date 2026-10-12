import { Component, inject, Input, input, InputSignal, OnInit, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { recievePaymentMainEditorFields } from '../../recieve-payment-editor-main-formly.config';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';

@Component({
  selector: 'app-recieve-payment-editor-main',
  standalone: true,
  imports: [
    FormlyConfigModule
  ],
  templateUrl: './recieve-payment-editor-main.component.html',
  styleUrl: './recieve-payment-editor-main.component.scss'
})
export class RecievePaymentEditorMainComponent implements OnInit {
  _apiService = inject(ApiService);
  _languageService = inject(LanguageService);
  _toastrNotifiService = inject(ToastrNotifiService);
  _unsubscribe = inject(UnsubscribeService)

  @Input() formly!: FormGroup;
  model: InputSignal<any> = input();
  onMatterChange = output()
  fields: any;
  lookupsData: any;
  isLoading: boolean = false;
  ngOnInit(): void {

    this.getLookupsData()
  }

  getLookupsData(): void {
    this.isLoading = true
    combineLatest({
      accounts: this._apiService.get(API_Config.general.getAccList),
      payments: this._apiService.get(API_Config.general.getPaymentsMethodList),
      receipt: this._apiService.get(API_Config.recievePayment.getOrNewRandomReceipt)
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res) => {
          this.lookupsData = res;
          this.initForm();
        },
      });
  }
  initForm() {
    // this.fields = recievePaymentMainEditorFields(this);
  }
}
