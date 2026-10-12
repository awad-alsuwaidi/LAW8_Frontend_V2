import { Component, inject, OnInit } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { clientDetailsContactEditorFormlyConfig } from './client-details-contact-editor-formly.config';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/@core/services';
import { FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-client-details-contacts-editor',
  standalone: true,
  imports: [FormlyConfigModule, SharedButtonComponent, TranslateModule],
  templateUrl: './client-details-contacts-editor.component.html',
  styleUrl: './client-details-contacts-editor.component.scss',
})
export class ClientDetailsContactsEditorComponent
  extends FormBaseClass
  implements OnInit
{
  formlyBaseFields: FormlyFieldConfig[] = [];
  formlyPersonalFields: FormlyFieldConfig[] = [];
  mode!: string;
  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.formlyFields = clientDetailsContactEditorFormlyConfig(this);
    if (this._dynamicDialogConfig.data.rowData) this.setFormData();
  }
  setFormData() {
    this.mode = this._dynamicDialogConfig.data.mode;
    this.formlyOptions.formState = {
      readonly: this.mode === 'view',
    };
    const params = {
      id: this._dynamicDialogConfig.data.rowData.id,
    };
    this._apiService
      .get(API_Config.clientsContact.getById, params)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.formlyModel = { ...res.result };
          }
        },
      });
  }
  onEdit() {
    this.formlyOptions.formState.readonly = false;
  }
  onSubmit(): void {
    const successMsgKey = this._dynamicDialogConfig?.data?.rowData
      ? 'messages.updateSuccessfully'
      : 'messages.createdSuccessfully';
    console.log('onSubmit', this.formlyModel);
    const payload = {
      ...this.formlyModel,
      clientId: this._dynamicDialogConfig?.data?.clientId,
      phone: this.formlyModel?.phone?.internationalNumber
        ? this.formlyModel?.phone?.internationalNumber
        : this.formlyModel.phone,
      mobile: this.formlyModel?.mobile?.internationalNumber
        ? this.formlyModel?.mobile?.internationalNumber
        : this.formlyModel.mobile,
    };
    const requestPayload = this._dynamicDialogConfig?.data?.rowData
      ? {
          ...payload,
          id: this._dynamicDialogConfig?.data?.rowData?.id,
        }
      : payload;
    const path = this._dynamicDialogConfig?.data?.rowData
      ? API_Config.clientsContact.update
      : API_Config.clientsContact.create;
    this._apiService
      .post(path, requestPayload)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            const text = this._languageService.getTransValue(successMsgKey);
            this._toastrNotifiService.displaySuccess(text);
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
