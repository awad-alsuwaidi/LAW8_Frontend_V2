import {
  Component,
  inject,
  Input,
  input,
  InputSignal,
  output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { preBillsMainEditorFields } from './pre-bills-main-editor-formly.config';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pre-bill-main-editor',
  standalone: true,
  imports: [FormlyConfigModule],
  templateUrl: './pre-bill-main-editor.component.html',
  styleUrl: './pre-bill-main-editor.component.scss',
})
export class PreBillMainEditorComponent {
  _apiService = inject(ApiService);
  _languageService = inject(LanguageService);
  _toastrNotifiService = inject(ToastrNotifiService);
  _unsubscribe = inject(UnsubscribeService);

  @Input() formly!: FormGroup;
  model: InputSignal<any> = input();
  onMatterChange = output();
  isInhouse = environment.brand === 'inhouse';

  fields: any;
  lookupsData: any = {};
  isLoading = false;
  isPreBill = true;

  ngOnInit(): void {
    this.initForm();
    this.loadLookups();

    if (this.model()) {
      this.getMatterDetailsById(this.model()?.law_MatterId);
    }
  }

  initForm() {
    this.fields = preBillsMainEditorFields(this);
  }

  loadLookups(): void {
    this.isLoading = true;
    combineLatest({
      matterList: this._apiService.get(API_Config.general.getMatterCodes),
      templateList: this._apiService.get(
        API_Config.general.getBillingTempletsList
      ),
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: ({ matterList, templateList }) => {
          if (!matterList.isSuccess || !templateList.isSuccess) return;

          this.lookupsData = { matterList, templateList };

          this.patchOptions('law_MatterId', matterList.result, 'id', 'name');
          this.patchOptions('templetId', templateList.result, 'id', 'name');

          if (this.model()) {
            this.getMatterDetailsById(this.model()?.law_MatterId);
          }
        },
      });
  }

  getMatterDetailsById(matterId: number) {
    this._apiService
      .get(`${API_Config.bill.getMatterDetailsById}`, { MatterId: matterId })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.onMatterChange.emit(res.result);
            this.formly.patchValue(res.result);
          }
        },
      });
  }

patchOptions(key: string, data: any[], valueKey: string, labelKey: string) {
  const field = this.fields[0].fieldGroup.find((f: any) => f.key === key);

  if (field) {
    const sortedData = (data || []).sort((a, b) =>
      new Date(a.actionDate).getTime() - new Date(b.actionDate).getTime()
    );

    field.props.optionsArr = getOptionsArray(sortedData, valueKey, labelKey);
    field.props.loading = false;
  }
}

  billInvoiceNumberCheck(invoiceNumber: number) {
    this._apiService
      .get(API_Config.billInvoiceNumberCheck.get, {
        InvoiceNumber: invoiceNumber,
      })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (!res.result.isValid) {
            this._toastrNotifiService.displayError(res.result.message);
          }
        },
      });
  }

}
