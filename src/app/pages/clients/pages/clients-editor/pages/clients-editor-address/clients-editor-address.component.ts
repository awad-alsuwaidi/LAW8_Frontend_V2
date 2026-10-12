import { Component, inject, Input } from '@angular/core';
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
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';

@Component({
  selector: 'app-clients-editor-address',
  standalone: true,
  imports: [
    FormlyConfigModule,
    TranslateModule
  ],
  templateUrl: './clients-editor-address.component.html',
  styleUrl: './clients-editor-address.component.scss'
})
export class ClientsEditorAddressComponent {
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
    combineLatest({
      country: this._apiService.get(API_Config.general.getCountryLookup),
    }).pipe(
      this._unsubscribe.takeUntilDestroy()
    ).subscribe((res) => {
      this.lookupsData = res;
      this.initForm();
      if(!this._router.url.includes('update'))this.getCountryOptions()
    })
  }

setCountryValue() {
  return (this.lookupsData?.country?.result ?? [])
    .find((x: any) => x.id === this.formlyModel?.countryId) ?? null;
}
getCountryOptions() {
  const countryField = findField(this.formlyFields, 'countryId');
  if (!countryField) return;

  const list = this.lookupsData?.country?.result ?? [];

  countryField.props = {
    ...countryField.props,
    optionsArr: list,
    optionLabel: 'name',
    optionValue: 'id',
  };

  if (this.formlyModel?.countryId) {
    countryField.props = {
      ...countryField.props,
      selectedObj: list.find((x: { id: any; }) => x.id === this.formlyModel.countryId) ?? null,
    };
  }
}

}
