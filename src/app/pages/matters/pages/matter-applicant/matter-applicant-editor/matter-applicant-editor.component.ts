import { Component, OnInit } from '@angular/core';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { applicantEditorFormlyConfig } from './applicant-editor-formly.config';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-matter-applicant-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    TranslateModule
  ],
  templateUrl: './matter-applicant-editor.component.html',
  styleUrl: './matter-applicant-editor.component.scss'
})
export class MatterApplicantEditorComponent extends FormBaseClass implements OnInit {
  mode!: string;
  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.formlyFields = applicantEditorFormlyConfig(this);
    if (this._dynamicDialogConfig.data.rowData) this.setFormData();
  }
  setFormData() {
    this.mode = this._dynamicDialogConfig.data.mode
    this.formlyOptions.formState = {
      readonly: this.mode === 'view'
    }
    if (this._router.url.includes('add')&& this.mode) {
      this.formlyModel = {
        ...this._dynamicDialogConfig.data.rowData,
     
      }
      return
    }
    const params = {
      id: this._dynamicDialogConfig.data.rowData.id
    }
    this._apiService.get(API_Config.matterApplicant.getById, params).pipe(
      this._unsubscribe.takeUntilDestroy()
    ).subscribe({
      next: (res: ApiRes) => {
        if (res && res.isSuccess) {
          this.formlyModel = { ...res.result };

        }
      }
    })

  }
  onEdit() {
    this.formlyOptions.formState.readonly = false;
  }
  onSubmit(): void {
    const payload = {
      ...this.formlyModel,
      law_MatterId: this._dynamicDialogConfig?.data?.id,
     
    }
    if (this._router.url.includes('add')) {
      payload.fullName=`${payload?.firstName} ${payload?.lastName}`
      this._dynamicDialogRef.close(payload);
      return
    }
    const requestPayload = this._dynamicDialogConfig?.data?.rowData
      ? {
        ...payload,
        id: this._dynamicDialogConfig?.data?.rowData?.id,

      }
      : payload;
    const path = this._dynamicDialogConfig?.data?.rowData
      ? API_Config.matterApplicant.update
      : API_Config.matterApplicant.create;
    this._apiService
      .post(path, requestPayload)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this._dynamicDialogRef.close(true)
            this._toastrNotifiService.displaySuccess(res.message);
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


