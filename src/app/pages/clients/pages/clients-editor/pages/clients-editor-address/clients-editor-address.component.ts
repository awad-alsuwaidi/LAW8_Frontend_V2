import { Component, inject, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { clientsEditorAddressFormlyFieldsConfig } from './clients-editor-address-formly-fields.config';
import { combineLatest } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { ApiService } from 'src/app/@core/api/api.service';
import { LanguageService } from 'src/app/@core/services';
import { TranslateModule } from '@ngx-translate/core';
import { FieldTypeConfig } from '@ngx-formly/core';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clients-editor-address',
  standalone: true,
  imports: [FormlyConfigModule, TranslateModule],
  templateUrl: './clients-editor-address.component.html',
  styleUrl: './clients-editor-address.component.scss',
})
export class ClientsEditorAddressComponent implements OnInit {
  _apiService = inject(ApiService);
  _languageService = inject(LanguageService);
  _unsubscribe = inject(UnsubscribeService);
  _router = inject(Router);

  @Input() formly: FormGroup = new FormGroup({});
  @Input() formlyModel: any;
  @Input() options: any;
  @Input() lookupsData: any = {};

  formlyFields: any[] = [];

  ngOnInit(): void {
    this.getLookupsData();
  }

  initForm() {
    this.formlyFields = clientsEditorAddressFormlyFieldsConfig(this);
  }

getLookupsData() {
  const isView =
    this._router.url.includes('view') ||
    this._router.url.includes('details');

  if (isView) {
    this.initForm();
    return;
  }

  this._apiService
    .get(API_Config.countries.get)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: any) => {
        const body = res?.data ?? res?.result ?? res;
        const items =
          body?.items ??
          body?.dataList ??
          (Array.isArray(body) ? body : []);

        this.lookupsData = { country: { result: items } };

        this.initForm();
        if (!this._router.url.includes('update')) this.getCountryOptions();
      },
    });
}

  setCountryValue() {
    return (
      (this.lookupsData?.country?.result ?? []).find(
        (x: any) => x.id === this.formlyModel?.countryId,
      ) ?? null
    );
  }

  getCountryOptions() {
    const field = findField(this.formlyFields, 'countryId');
    if (!field) return;

    const list = this.lookupsData?.country?.result ?? [];
    const nameKey =
      this._languageService.getSelectedLanguage() === 'en'
        ? 'nameEn'
        : 'nameAr';

    field.props = {
      ...field.props,
      optionsArr: list,
      optionLabel: nameKey,
      optionValue: 'id',
    };

    if (this.formlyModel?.countryId) {
      field.props = {
        ...field.props,
        selectedObj:
          list.find((x: any) => x.id === this.formlyModel.countryId) ?? null,
      };
    }
  }
}
