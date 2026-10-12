import { Component, OnInit } from '@angular/core';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedButtonComponent } from '../../../shared-button/shared-button.component';
import { contactEditorFormlyConfig } from './contact-editor-formly.config';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-shared-contact-editor',
  standalone: true,
  imports: [FormlyConfigModule, SharedButtonComponent, TranslateModule],
  templateUrl: './shared-contact-editor.component.html',
  styleUrl: './shared-contact-editor.component.scss',
})
export class SharedContactEditorComponent
  extends FormBaseClass
  implements OnInit
{
  mode!: string;
  ngOnInit(): void {
    this.loadCategories();
    this.initForm();
  }
  loadCategories() {
    this._apiService.get(API_Config.general.getContactsCategory).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.lookupsData.category = res.result;
          this.formlyFields = contactEditorFormlyConfig(this);
        }
      },
      error: (err) => {
        console.error('Error loading categories', err);
      },
    });
  }

  initForm(): void {
    this.formlyFields = contactEditorFormlyConfig(this);
    if (this._dynamicDialogConfig.data.rowData) this.setFormData();
  }
 setFormData() {
  this.mode = this._dynamicDialogConfig.data.mode;

  this.formlyOptions.formState = {
    readonly: this.mode === 'view',
    isViewMode: this.mode === 'view',
  };

  if (this._router.url.includes('add')) {
    this.formlyModel = this._dynamicDialogConfig.data.rowData;
    return;
  }

  const params = {
    id: this._dynamicDialogConfig.data.rowData.id,
  };

  const endpoint = this._dynamicDialogConfig.data.endpoint;

  this._apiService.get(endpoint.getById, params).subscribe({
    next: (res: ApiRes) => {
      if (res && res.isSuccess) {
        this.formlyModel = {
          ...res.result,
          categoryId: Number(res.result.categoryId),
        };
      }
    },
  });
}

onEdit() {
  this.formlyOptions.formState = {
    ...this.formlyOptions.formState,
    readonly: false,
    isViewMode: false,
  };
  this._dynamicDialogConfig.header = this._languageService.getTransValue('matters.editContact'); 
  this.formlyFields = contactEditorFormlyConfig(this);
}

  onSubmit(): void {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      return;
    }
    const payload = {
      ...this.formlyModel,
      [this._dynamicDialogConfig?.data['idKey'] === 'matterId'
        ? 'law_MatterId'
        : this._dynamicDialogConfig?.data['idKey']]:
        this._dynamicDialogConfig?.data?.id,
    };
    if (this._router.url.includes('add')) {
      payload.fullName = `${payload?.firstName} ${payload?.lastName}`;
      this._dynamicDialogRef.close(payload);
      return;
    }
    const requestPayload = this._dynamicDialogConfig?.data?.rowData
      ? {
          ...payload,
          id: this._dynamicDialogConfig?.data?.rowData?.id,
        }
      : payload;
    const path = this._dynamicDialogConfig?.data?.rowData
      ? this._dynamicDialogConfig?.data['endpoint'].update
      : this._dynamicDialogConfig?.data['endpoint'].create;
    this._apiService
      .post(path, requestPayload)
      .pipe(this._unsubscribe.takeUntilDestroy())
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
