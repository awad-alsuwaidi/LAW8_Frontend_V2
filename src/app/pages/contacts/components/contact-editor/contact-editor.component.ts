import { Component, OnInit } from '@angular/core';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';

import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { contactEditorFormlyConfig } from './contact-editor-formly.config';
import { combineLatest, finalize } from 'rxjs';

@Component({
  selector: 'app-contact-editor',
  standalone: true,
  imports: [SharedButtonComponent, SharedModule, FormlyConfigModule],
  templateUrl: './contact-editor.component.html',
  styleUrl: './contact-editor.component.scss',
})
export class ContactEditorComponent extends FormBaseClass implements OnInit {
  override isLoading = true;
  mode!: string;

  ngOnInit(): void {
    this.mode = this._dynamicDialogConfig.data?.mode;

    this.getLookupsData();

    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }
  override getLookupsData(): void {
    combineLatest({
      category: this._apiService.get(API_Config.general.getContactsCategory),
      type: this._apiService.get(API_Config.general.getContactsType),
    })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res) => {
          this.lookupsData = res;
          this.initForm();
        },
      });
  }
  // initForm(): void {
  //   this.formlyFields = contactEditorFormlyConfig(this);
  //   if (this._dynamicDialogConfig.data.rowData) this.setFormData();
  // }
  initForm(): void {
    this.formlyFields = contactEditorFormlyConfig(this);

    this.formlyOptions.formState = {
      readonly: this._dynamicDialogConfig.data?.isViewMode ?? false,
    };

    if (this._dynamicDialogConfig.data.rowData) {
      this.setFormData();
    }
  }
  setFormData() {
    const params = {
      id: this._dynamicDialogConfig.data.rowData.id,
    };

    this._apiService
      .get(API_Config.contacts.getById, params)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.formlyModel = {
              ...res.result,
              categoryId: Number(res.result.categoryId),
            };

            this.formlyOptions = {
              ...this.formlyOptions,
              formState: {
                readonly: this.mode === 'view',
                isViewMode: this.mode === 'view',
              },
            };
          }
        },
      });
  }
  // onEdit() {
  //   this.formlyOptions.formState.readonly = false;
  // }
  onEdit() {
    this.formlyOptions = {
      ...this.formlyOptions,
      formState: {
        readonly: false,
        isViewMode: false,
      },
    };
    this._dynamicDialogConfig.header = this._languageService.getTransValue('matters.editContact'); 
    this.formlyFields = [...contactEditorFormlyConfig(this)];
  }

  onSubmit(): void {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      return;
    }
    const requestPayload = this._dynamicDialogConfig?.data?.rowData
      ? {
          ...this.formlyModel,
          id: this._dynamicDialogConfig?.data?.rowData?.id,
        }
      : this.formlyModel;
    const path = this._dynamicDialogConfig?.data?.rowData
      ? API_Config.contacts.update
      : API_Config.contacts.create;
    this.isSubmitted = true;
    this._apiService
      .post(path, requestPayload)
      .pipe(
        finalize(() => (this.isSubmitted = false)),
        this._unsubscribe.takeUntilDestroy(),
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
