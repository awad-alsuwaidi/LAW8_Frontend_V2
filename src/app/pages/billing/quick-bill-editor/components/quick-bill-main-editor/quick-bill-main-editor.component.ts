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
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { quickBillMainEditorFields } from './quick-bill-main-editor-formly.config';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-quick-bill-main-editor',
  standalone: true,
  imports: [FormlyConfigModule],
  templateUrl: './quick-bill-main-editor.component.html',
  styleUrl: './quick-bill-main-editor.component.scss',
})
export class QuickBillMainEditorComponent {
  _apiService = inject(ApiService);
  _languageService = inject(LanguageService);
  _toastrNotifiService = inject(ToastrNotifiService);
  _unsubscribe = inject(UnsubscribeService);

  @Input() formly!: FormGroup;
  model: InputSignal<any> = input();
  onMatterChange = output();
  fields: any;
  lookupsData: any = {};
  isInhouse = environment.brand === 'inhouse';

  ngOnInit(): void {
    localStorage.removeItem('selectedMatterId');
    this.initForm();
    this.getLookupsData();
  }

  initForm() {
    this.fields = quickBillMainEditorFields(this);
  }

  getLookupsData(): void {
    combineLatest({
      matterList: this._apiService.get(API_Config.general.getMatterCodes),
      templateList: this._apiService.get(
        API_Config.general.getBillingTempletsList,
      ),
    })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: ({ matterList, templateList }) => {
          if (!matterList.isSuccess || !templateList.isSuccess) return;
          this.lookupsData = { matterList, templateList };
          this.patchOptions('law_MatterId', matterList.result, 'id', 'name');
          this.patchOptions('templetId', templateList.result, 'id', 'name');
        },
      });
  }

  patchOptions(key: string, data: any[], valueKey: string, labelKey: string) {
    const field = this.fields[0].fieldGroup.find((f: any) => f.key === key);
    if (field) {
      field.props.optionsArr = data.map((d) => ({
        value: d[valueKey],
        label: d[labelKey],
      }));
      field.props.loading = false;
    }
  }

  getMatterDetailsById(matterId: number) {
    const params = { MatterId: matterId };
    this._apiService
      .get(`${API_Config.bill.getMatterDetailsById}`, params)
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

  billInvoiceNumberCheck(invoiceNumber: number) {
    let params = { InvoiceNumber: invoiceNumber };
    this._apiService
      .get(API_Config.billInvoiceNumberCheck.get, params)
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
