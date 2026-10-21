import { Component, OnInit } from '@angular/core';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
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
    this.formlyOptions.formState = { readonly: false, isViewMode: false };
    this.loadCategories().subscribe({
      next: (res: any) => {
        const items = this.extractItems(res);
        this.lookupsData.category = items;
        this.initForm();
      },
      error: (err) => {
        this.lookupsData.category = [];
        this.initForm();
      },
    });
  }

  private extractItems(res: any): any[] {
    if (!res) return [];
    if (res?.success === true && Array.isArray(res?.data?.items))
      return res.data.items;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    if (Array.isArray(res?.items)) return res.items;
    if (Array.isArray(res?.result?.items)) return res.result.items;
    if (Array.isArray(res?.result)) return res.result;
    if (Array.isArray(res)) return res;
    return [];
  }

  loadCategories() {
    return this._apiService.get(API_Config.general.getContactsCategoryV2);
  }

  initForm(): void {
    this.formlyFields = [...contactEditorFormlyConfig(this)];
    if (this._dynamicDialogConfig?.data?.rowData) {
      this.setFormData();
    }
  }

setFormData() {
  this.mode = this._dynamicDialogConfig.data.mode;

  this.formlyOptions.formState = {
    readonly: this.mode === 'view',
    isViewMode: this.mode === 'view',
  };

  const rowData = this._dynamicDialogConfig?.data?.rowData;
  if (!rowData) return;
  if (this._router.url.includes('add')) {
    this.formlyModel = rowData;
    return;
  }

  if (rowData.firstName !== undefined && rowData.id) {
    this._applyRow(rowData);
    return;
  }
  const params = { id: rowData.id };
  const endpoint = this._dynamicDialogConfig.data.endpoint;

  this._apiService.get(endpoint.getById, params).subscribe({
    next: (res: any) => {
      const row = this.extractRow(res);
      if (!row) return;
      this._applyRow(row);
    },
    error: (err) => console.error('[getById] error:', err),
  });
}

private _applyRow(row: any) {
  const categoryId = Number(
    row?.contactCategoryId ?? row?.categoryId ?? 0
  );

  const lang = (this._languageService.getSelectedLanguage() || '').toLowerCase();
  const nameKey = lang.startsWith('en') ? 'nameEn' : 'nameAr';
  const selectedCat = (this.lookupsData.category || []).find(
    (c: any) => Number(c.id) === categoryId,
  );
  const categoryName =
    selectedCat?.[nameKey] ||
    row?.contactCategoryName ||
    row?.categoryName ||
    '';

  this.formlyModel = {
    ...row,
    phone:  row?.phone1  ?? row?.phone  ?? '',
    mobile: row?.mobile1 ?? row?.mobile ?? '',
    categoryId,
    categoryName,
  };
}

  private extractRow(res: any): any | null {
    if (!res) return null;
    if (res?.success === true && res?.data) return res.data;
    if (res?.data) return res.data;
    if (res?.result) return res.result;
    return res;
  }

  onEdit() {
    this.formlyOptions.formState = {
      ...this.formlyOptions.formState,
      readonly: false,
      isViewMode: false,
    };
    this._dynamicDialogConfig.header = this._languageService.getTransValue(
      'matters.editContact',
    );
    this.formlyFields = [...contactEditorFormlyConfig(this)];
  }

onSubmit(): void {
  if (this.formly.invalid) {
    this.formly.markAllAsTouched();
    return;
  }

  const idKey = this._dynamicDialogConfig?.data?.['idKey'];
  const relatedId = this._dynamicDialogConfig?.data?.id;

  if (
    this._router.url.includes('add') &&
    !this._router.url.includes('add-contact')
  ) {
    const payload: any = { ...this.formlyModel };
    payload.fullName = `${payload?.firstName} ${payload?.lastName}`;
    this._dynamicDialogRef.close(payload);
    return;
  }

  const row = this._dynamicDialogConfig?.data?.rowData;
  const isEdit = !!row?.id;
  const endpoint = this._dynamicDialogConfig?.data?.['endpoint'];

  const apiPayload: any = {
    firstName: this.formlyModel.firstName,
    lastName: this.formlyModel.lastName,
    middleName: this.formlyModel.middleName,
    position: this.formlyModel.position,
    phone1: this.formlyModel.phone,
    mobile1: this.formlyModel.mobile,
    email: this.formlyModel.email,
    fax: this.formlyModel.fax,
    remarks: this.formlyModel.remarks,
    address: this.formlyModel.address,
    contactCategoryId: Number(this.formlyModel.categoryId),
  };

  if (idKey && relatedId != null) {
    const finalKey = idKey === 'matterId' ? 'law_MatterId' : idKey;
    apiPayload[finalKey] = Number(relatedId);
  }

  Object.keys(apiPayload).forEach(
    (k) => apiPayload[k] === undefined && delete apiPayload[k],
  );

  const url = isEdit
    ? `${endpoint.update}/${row.id}`
    : endpoint.create;

  const request$ = isEdit
    ? this._apiService.put(url, apiPayload)
    : this._apiService.post(url, apiPayload);

  request$
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: any) => {
        if (res?.success === true || res?.isSuccess === true) {
          this._toastrNotifiService.displaySuccess(res.message);
          this._dynamicDialogRef.close(true);
        } else {
          this._toastrNotifiService.displayError(res?.message);
        }
      },
      error: (err: any) => {
        console.error('[onSubmit] error:', err);
        this._toastrNotifiService.displayError(err?.error?.message);
      },
    });
}
}
