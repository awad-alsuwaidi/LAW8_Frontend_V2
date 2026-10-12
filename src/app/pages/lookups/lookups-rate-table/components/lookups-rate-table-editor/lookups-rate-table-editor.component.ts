import { Component, inject, OnInit } from '@angular/core';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { RateTableDto } from '../../interfaces/rate-table.interface';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { lookupsRateEditorConfig } from './lookups-rate-table-editor.config';
import { LookupsRateTableService } from '../../services/lookups-rate-table.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-lookups-rate-table-editor',
  standalone: true,
  imports: [FormlyConfigModule, SharedButtonComponent, TranslateModule],
  templateUrl: './lookups-rate-table-editor.component.html',
  styleUrl: './lookups-rate-table-editor.component.scss',
})
export class LookupsRateTableEditorComponent
  extends FormBaseClass
  implements OnInit
{
  rowData?: RateTableDto;
  _lookupsRateTableService = inject(LookupsRateTableService);
  ngOnInit(): void {
    this.initForm();
  }
override initForm(): void {
  this.formlyFields = lookupsRateEditorConfig(this);
  this.rowData = this._dynamicDialogConfig.data.rowData;

  if (this.rowData) {
    this.formlyModel = {
      nameEn: this.rowData.nameEn ?? '',
      nameAr: this.rowData.nameAr ?? '',
      isActive: this.rowData.isActive ?? true,
    };
  } else {
    this.formlyModel = {
      nameEn: '',
      nameAr: '',
      isActive: true,
    };
  }
}

override onSubmit(): void {
  if (this.formly.invalid) {
    this.formly.markAllAsTouched();
    return;
  }

  const requestPayload = {
    nameEn: this.formlyModel.nameEn,
    nameAr: this.formlyModel.nameAr,
    isActive: this.formlyModel.isActive ?? true,
  };

  const request$ = this.rowData
    ? this._apiService.put(
        `${API_Config.rateTypes.update}/${this.rowData.id}`,
        requestPayload
      )
    : this._apiService.post(API_Config.rateTypes.create, requestPayload);

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
          const updated =
            res.data ?? res.result ?? { ...this.rowData, ...requestPayload };
          this._dynamicDialogRef.close(updated);
        } else {
          this._toastrNotifiService.displayError(res?.message);
        }
      },
      error: (err: any) => {
        this._toastrNotifiService.displayError(err?.error?.message);
      },
    });
}
}
