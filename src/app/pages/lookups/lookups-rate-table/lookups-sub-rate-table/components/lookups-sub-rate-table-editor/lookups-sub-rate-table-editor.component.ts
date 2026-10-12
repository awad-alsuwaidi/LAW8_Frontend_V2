import { Component, OnInit } from '@angular/core';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { RateSubTableDto } from '../../../interfaces/rate-sub-table.interface';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { lookupsSubRateEditorConfig } from './lookups-sub-jurisdiction-editor.config';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-lookups-sub-rate-table-editor',
  standalone: true,
  imports: [FormlyConfigModule, SharedButtonComponent, TranslateModule],
  templateUrl: './lookups-sub-rate-table-editor.component.html',
  styleUrl: './lookups-sub-rate-table-editor.component.scss',
})
export class LookupsSubRateTableEditorComponent
  extends FormBaseClass
  implements OnInit
{
  rowData?: RateSubTableDto;
  jurisdictionIdentifier!: number;
  ngOnInit(): void {
    this.initForm();
  }


  override initForm(): void {
  this.formlyFields = lookupsSubRateEditorConfig(this);
  this.rowData = this._dynamicDialogConfig.data.rowData;
  this.jurisdictionIdentifier = this._dynamicDialogConfig.data.categoryId;

  if (this.rowData) {
    this.formlyModel = {
      name: this.rowData.name,
      code: (this.rowData as any).code ?? '',
      amount: this.rowData.amount,
      isActive: this.rowData.isActive ?? true,
      rateTypeId: this.rowData.rateTypeId ?? +this.jurisdictionIdentifier,
    };
  } else {
    this.formlyModel = {
      name: '',
      code: '',
      amount: 0,
      isActive: true,
      rateTypeId: +this.jurisdictionIdentifier,
    };
  }
}

override onSubmit(): void {
  if (this.formly.invalid) {
    this.formly.markAllAsTouched();
    return;
  }

  const requestPayload = {
    name: this.formlyModel.name,
    code: this.formlyModel.code ?? '',
    amount: +this.formlyModel.amount,
    isActive: this.formlyModel.isActive ?? true,
    rateTypeId: +(this.formlyModel.rateTypeId ?? this.jurisdictionIdentifier),
  };

  const request$ = this.rowData
    ? this._apiService.put(
        `${API_Config.rates.update}/${this.rowData.id}`,
        requestPayload
      )
    : this._apiService.post(API_Config.rates.create, requestPayload);

  this.isLoading = true;

  request$
    .pipe(
      finalize(() => (this.isLoading = false)),
      this._unsubscribe.takeUntilDestroy()
    )
    .subscribe({
      next: (res: any) => {
        if (res && (res.isSuccess || res.success)) {
          this._toastrNotifiService.displaySuccess(res.message);
          this._dynamicDialogRef.close(true);
        } else {
          this._toastrNotifiService.displayError(res?.message);
        }
      },
      error: (err: any) =>
        this._toastrNotifiService.displayError(err?.error?.message),
    });
}
}
