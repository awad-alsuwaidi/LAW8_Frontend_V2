import { Component, inject, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LookupJurisdictionsDto } from '../../interfaces/lookup-jurisdictions';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { lookupsJurisdictionEditorConfig } from './lookups-jurisdictions-editor.config';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-lookups-jurisdictions-editor',
  standalone: true,
  imports: [FormlyConfigModule, SharedButtonComponent, TranslateModule],
  templateUrl: './lookups-jurisdictions-editor.component.html',
  styleUrl: './lookups-jurisdictions-editor.component.scss',
})
export class LookupsJurisdictionsEditorComponent
  extends FormBaseClass
  implements OnInit
{
  rowData?: LookupJurisdictionsDto;

  ngOnInit(): void {
    this.initForm();
  }

override initForm(): void {
  this.formlyFields = lookupsJurisdictionEditorConfig(this);
  this.rowData = this._dynamicDialogConfig.data.rowData;

  console.log('🔍 rowData passed to dialog:', this.rowData);

  if (this.rowData) {
    // ★★★★★ يقبل isActive أو active + fallback
    const isActive =
      typeof (this.rowData as any).isActive === 'boolean'
        ? (this.rowData as any).isActive
        : typeof (this.rowData as any).active === 'boolean'
          ? (this.rowData as any).active
          : true;   // ★ default لو الاتنين مش موجودين

    this.formlyModel = {
      nameEn: this.rowData.nameEn ?? '',
      nameAr: this.rowData.nameAr ?? '',
      isActive: isActive,
    };
  } else {
    this.formlyModel = {
      nameEn: '',
      nameAr: '',
      isActive: true,
    };
  }

  console.log('🔍 formlyModel:', this.formlyModel);
}

override onSubmit(): void {
  if (this.formly.invalid) {
    this.formly.markAllAsTouched();
    return;
  }

  // ★ الـ Jurisdiction مش محتاج jurisdictionId خالص
  const requestPayload = {
    nameEn: this.formlyModel.nameEn,
    nameAr: this.formlyModel.nameAr,
    isActive: this.formlyModel.isActive ?? true,
  };

  const request$ = this.rowData
    ? this._apiService.put(
        `${API_Config.jurisdictions.update}/${this.rowData.id}`,
        requestPayload
      )
    : this._apiService.post(API_Config.jurisdictions.create, requestPayload);

  this.isLoading = true;

  request$
    .pipe(
      finalize(() => (this.isLoading = false)),
      this._unsubscribe.takeUntilDestroy()
    )
    .subscribe({
      next: (res: ApiRes) => {
        if (res && res.isSuccess) {
          this._toastrNotifiService.displaySuccess(res.message);
          const updated =
            (res as any).data ??
            (res as any).result ??
            { ...this.rowData, ...requestPayload };
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