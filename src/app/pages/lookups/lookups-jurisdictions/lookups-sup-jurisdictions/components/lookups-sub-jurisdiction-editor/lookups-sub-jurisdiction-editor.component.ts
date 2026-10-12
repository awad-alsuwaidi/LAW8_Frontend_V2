import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { lookupsSubJurisdictionEditorConfig } from './llookups-sub-jurisdiction-editor.config';
import { LookupSubjurisdictionDto } from '../../../interfaces/lookup-sup-jurisdictions';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-lookups-sub-jurisdiction-editor',
  standalone: true,
  imports: [SharedButtonComponent, FormlyConfigModule, TranslateModule],
  templateUrl: './lookups-sub-jurisdiction-editor.component.html',
  styleUrl: './lookups-sub-jurisdiction-editor.component.scss',
})
export class LookupsSubJurisdictionEditorComponent
  extends FormBaseClass
  implements OnInit
{
  rowData?: LookupSubjurisdictionDto;
  jurisdictionIdentifier!: number;

  ngOnInit(): void {
    this.initForm();
  }

override initForm(): void {
  this.formlyFields = lookupsSubJurisdictionEditorConfig(this);
  this.rowData = this._dynamicDialogConfig.data.rowData;
  this.jurisdictionIdentifier = this._dynamicDialogConfig.data.categoryId;

  if (this.rowData) {
    // ★ التعديل — تأكد إن jurisdictionId بياخد القيمة الصح
    this.formlyModel = {
      nameEn: this.rowData.nameEn,
      nameAr: this.rowData.nameAr,
      isActive: this.rowData.isActive,
      // ★ لو الباك بيرجع الحقل باسم تاني، عدّله
      jurisdictionId:
        this.rowData.jurisdictionId ??
        (this.rowData as any).law_JurisdictionId ??
        this.jurisdictionIdentifier,   // ★ fallback من الـ dialog
    };
  } else {
    // الإضافة
    this.formlyModel = {
      nameEn: '',
      nameAr: '',
      isActive: true,
      jurisdictionId: +this.jurisdictionIdentifier,
    };
  }
}

override onSubmit(): void {
  if (this.formly.invalid) {
    this.formly.markAllAsTouched();
    return;
  }

  // ★ تأكد إن jurisdictionId مش null
  const jurisdictionId =
    this.formlyModel.jurisdictionId ??
    this.jurisdictionIdentifier;

  const requestPayload = {
    nameEn: this.formlyModel.nameEn,
    nameAr: this.formlyModel.nameAr,
    isActive: this.formlyModel.isActive ?? true,
    jurisdictionId: +jurisdictionId,
  };

  const request$ = this.rowData
    ? this._apiService.put(
        `${API_Config.judicatures.update}/${this.rowData.id}`,
        requestPayload
      )
    : this._apiService.post(
        API_Config.judicatures.create,
        requestPayload
      );

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
          this._dynamicDialogRef.close(true);
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