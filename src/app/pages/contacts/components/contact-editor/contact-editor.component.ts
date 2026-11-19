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
    })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const extractList = (response: any): any[] => {
            if (!response) return [];
            const body = response?.data || response?.result || response;
            if (Array.isArray(body)) return body;
            return body?.items || body?.dataList || [];
          };

          const categories = extractList(res.category).map((c: any) => ({
            ...c,
            name: c.nameEn || c.nameAr || c.name || '',
          }));

          const types = extractList(res.type).map((t: any) => ({
            ...t,
            name: t.nameEn || t.nameAr || t.name || '',
          }));

          this.lookupsData = {
            category: { result: categories },
            type: { result: types },
          };

          this.initForm();
        },
        error: (err) => {
          this.lookupsData = {
            category: { result: [] },
            type: { result: [] },
          };
          this.initForm();
        },
      });
  }
  
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
    const url = `${API_Config.contacts.getById}/${this._dynamicDialogConfig.data.rowData.id}`;

    this._apiService
      .get(url)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          const data = res?.data ?? res?.result;
          
          if (isSuccess && data) {
            this.formlyModel = {
              ...data,
              contactCategoryId: Number(data.contactCategoryId),
              
              category: data.contactCategoryName || '', 
              phone1: data.phone1 ?? '',
              phone2: data.phone2 ?? '',
              mobile1: data.mobile1 ?? '',
              mobile2: data.mobile2 ?? '',
              fax: data.fax ?? '',
              position: data.position ?? '',
              remarks: data.remarks ?? ''
            };

            this.formlyOptions = {
              ...this.formlyOptions,
              formState: { readonly: this.mode === 'view', isViewMode: this.mode === 'view' },
            };
          }
        },
      });
  }

  onSubmit(): void {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      return;
    }

    const isUpdate = !!this._dynamicDialogConfig?.data?.rowData?.id;
    const rowData = this._dynamicDialogConfig?.data?.rowData;

    const requestPayload = { ...this.formlyModel };

    const path = isUpdate
      ? `${API_Config.contacts.update}/${rowData.id}`
      : API_Config.contacts.create;

    this.isSubmitted = true;
    
    const req$ = isUpdate
      ? this._apiService.put(path, requestPayload)
      : this._apiService.post(path, requestPayload);

    req$
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
          this._toastrNotifiService.displayError(err?.error?.message || 'Something went wrong');
        },
      });
  }

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

}
