import { Component } from '@angular/core';
import { FieldTypeConfig } from '@ngx-formly/core';
import { FieldType } from '@ngx-formly/core';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from '@justin-s/ngx-intl-tel-input';
@Component({
  selector: 'app-formly-phone-field',
  templateUrl: './formly-phone-field.component.html',
  styleUrl: './formly-phone-field.component.scss'
})
export class FormlyPhoneFieldComponent extends FieldType<FieldTypeConfig>{
  separateDialCode = false;
	SearchCountryField = SearchCountryField;
	CountryISO = CountryISO;
	PhoneNumberFormat = PhoneNumberFormat;
	preferredCountries: CountryISO[] = [CountryISO.UnitedArabEmirates];
}
