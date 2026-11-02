import { Component, OnInit } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { matterAddressFormlyFields } from './matter-address-editor-formly.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-matter-address-editor',
  standalone: true,
  imports: [SharedModule, FormlyConfigModule, SharedButtonComponent],
  templateUrl: './matter-address-editor.component.html',
  styleUrl: './matter-address-editor.component.scss',
})
export class MatterAddressEditorComponent
  extends FormBaseClass
  implements OnInit
{
  isSaveAndNew = false;

  ngOnInit(): void {
    this.getLookupsData();
  }

  override getLookupsData(): void {
    this._apiService
      .get(API_Config.general.getLookups, { types: 'countries' })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          console.log('[Address Lookups] raw res:', res);
          const countries = this.extractAndMapCountries(res);
          console.log('[Address Lookups] countries:', countries);

          this.lookupsData = { country: { result: countries } };
          this.initForm();
        },
        error: (err) => {
          console.error('[Address Lookups] error:', err);
          this.lookupsData = { country: { result: [] } };
          this.initForm();
        },
      });
  }

  private extractAndMapCountries(res: any): any[] {
    const raw = this.extractCountryList(res);
    const isAr = this.isArabic();

    return raw
      .filter((c: any) => !!c && c.id != null)
      .map((c: any) => ({
        ...c,
        name:
          (isAr ? c.nameAr || c.nameEn : c.nameEn || c.nameAr) ||
          c.name ||
          `#${c.id}`,
      }));
  }


  private extractCountryList(res: any): any[] {
    if (Array.isArray(res?.result?.countries)) return res.result.countries;
    if (Array.isArray(res?.data?.countries)) return res.data.countries;
    if (Array.isArray(res?.countries)) return res.countries;
    if (Array.isArray(res?.result)) return res.result;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.result?.dataList)) return res.result.dataList;
    if (Array.isArray(res?.data?.dataList)) return res.data.dataList;
    return [];
  }


  private isArabic(): boolean {
    const ls = this._languageService as any;
    const lang =
      ls?.currentLang ??
      ls?.getCurrentLang?.() ??
      ls?.getCurrentLanguage?.() ??
      ls?.getLanguage?.() ??
      ls?.currentLanguage ??
      (typeof document !== 'undefined' ? document.documentElement.lang : '') ??
      'en';
    return String(lang).toLowerCase().startsWith('ar');
  }


  override initForm(): void {
    this.formlyFields = matterAddressFormlyFields(this);
    this.setFormData();
  }

  setFormData(): void {
    const row = this._dynamicDialogConfig?.data?.rowData;
    if (!row) {
      this.formlyModel = {};
      return;
    }

    const countries: any[] = this.lookupsData?.country?.result ?? [];
    let countryId = row.countryId ?? null;

    if (!countryId && row.countryName) {
      const match = countries.find(
        (c) =>
          c.name === row.countryName ||
          c.nameEn === row.countryName ||
          c.nameAr === row.countryName,
      );
      if (match) countryId = match.id;
    }

    this.formlyModel = {
      line1: row.line1 ?? '',
      line2: row.line2 ?? '',
      zipCode: row.zipCode ?? '',
      countryId,
      city: row.city ?? '',
      state: row.state ?? '',
    };
  }

  reset(): void {
    this.formlyModel = {};
    this.formly.reset(this.formlyModel);
  }
override onSubmit(): void {
  if (this.formly.invalid) {
    this.formly.markAllAsTouched();
    this.isSaveAndNew = false;
    return;
  }

  this.isLoading = true;

  const row = this._dynamicDialogConfig?.data?.rowData;
  const isEdit = !!row;
  const m = this.formlyModel as any;
  const matterId = this._dynamicDialogConfig?.data?.matterIdentifier;

  if (!matterId) {
    this.isLoading = false;
    this.isSaveAndNew = false;
    this._toastrNotifiService.displayError('Matter ID is missing');
    console.error('[MatterAddress] matterIdentifier is missing in dialog data');
    return;
  }

  const basePayload = {
    line1: m.line1,
    line2: m.line2,
    zipCode: m.zipCode,
    countryId: m.countryId,
    city: m.city,
    state: m.state,
    matterId,          
  };

  const requestPayload = isEdit
    ? { ...basePayload, id: row.id }
    : basePayload;     

  let path = isEdit
    ? API_Config.matterAddress.update
    : API_Config.matterAddress.create;

  if (isEdit) {
    path = path.includes('{id}')
      ? path.replace('{id}', String(row.id))
      : `${path}/${row.id}`;
  }

  const req$ = isEdit
    ? this._apiService.put(path, requestPayload)
    : this._apiService.post(path, requestPayload);

  req$
    .pipe(
      finalize(() => (this.isLoading = false)),
      this._unsubscribe.takeUntilDestroy(),
    )
    .subscribe({
      next: (res: ApiRes) => {
        if (res && res.isSuccess) {
          this._toastrNotifiService.displaySuccess(res?.message);
          if (this.isSaveAndNew) {
            this.reset();
          } else {
            this._dynamicDialogRef.close(true);
          }
          this.isSaveAndNew = false;
        } else {
          this._toastrNotifiService.displayError(res?.message);
        }
      },
      error: (err: any) => {
        this._toastrNotifiService.displayError(err?.error?.message);
      },
    });
}
  saveAndNew(): void {
    this.isSaveAndNew = true;
    this.onSubmit();
  }
}