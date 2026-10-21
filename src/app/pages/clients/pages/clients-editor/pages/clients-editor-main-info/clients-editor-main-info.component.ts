import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { clientsEditorMainInfoFormlyFieldsConfig } from './clients-editor-main-info-formly-fields.config';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { combineLatest } from 'rxjs';
import { ApiService } from 'src/app/@core/api/api.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { LanguageService } from 'src/app/@core/services/language.service';
import { FieldTypeConfig } from '@ngx-formly/core';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { ClientService } from 'src/app/pages/clients/services/client.service';

@Component({
  selector: 'app-clients-editor-main-info',
  standalone: true,
  imports: [FormlyConfigModule, TranslateModule],
  templateUrl: './clients-editor-main-info.component.html',
  styleUrl: './clients-editor-main-info.component.scss',
})
export class ClientsEditorMainInfoComponent implements OnInit, OnChanges {
  isInhouse = environment.brand === 'inhouse';

  _apiService = inject(ApiService);
  _unsubscribe = inject(UnsubscribeService);
  _languageService = inject(LanguageService);
  _router = inject(Router);

  @Input() formly: FormGroup = new FormGroup({});
  @Input() formlyModel: any;
  @Input() options: any;
  @Input() lookupsData: any;

  formlyFields: any[] = clientsEditorMainInfoFormlyFieldsConfig(this);

  ngOnInit(): void {
    this.getLookupsData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getClientGroupOptions();
    this.getIntroducingLawyerOptions();
    this.setClientTypeField();
  }


  private _clientService = inject(ClientService);      

 getLookupsData() {
  const isView =
    this._router.url.includes('view') ||
    this._router.url.includes('details');
  const isAdd = this._router.url.includes('add');
  if (isView) {
    this.formlyFields = clientsEditorMainInfoFormlyFieldsConfig(this);
    setTimeout(() => {
      this.getClientGroupOptions();
      this.getIntroducingLawyerOptions();
      this.setClientTypeField();
    });
    return;
  }

  const endpoints: any = {
    introducingLawyer: this._apiService.get(API_Config.usersLookup.get, { isLawyer: true }),
    clientGroup: this._apiService.get(API_Config.clientGroups.get),
  };

  if (isAdd) {
    endpoints.clientCode = this._apiService.get(API_Config.client.nextCode);
  }

  combineLatest(endpoints)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: any) => {
          const unwrap = (r: any) => {
            const body = r?.data ?? r?.result ?? r;
            return {
              result: body?.items ?? body?.dataList ?? (Array.isArray(body) ? body : []),
            };
          };

          const codeBody =
            res?.clientCode?.data ??
            res?.clientCode?.result ??
            res?.clientCode;

          if (isAdd && codeBody) {
            this._clientService.setClientCode(codeBody);
          }

          this.lookupsData = {
            clientCode: isAdd ? { result: codeBody } : null,
            introducingLawyer: unwrap(res.introducingLawyer),
            clientGroup: unwrap(res.clientGroup),
          };

          this.formlyFields = clientsEditorMainInfoFormlyFieldsConfig(this);

          setTimeout(() => {
            this.getClientGroupOptions();
            this.getIntroducingLawyerOptions();
            this.setClientTypeField();

            if (isAdd && codeBody) {
              const codeField: FieldTypeConfig = findField(
                this.formlyFields,
                'clientCode'
              );
              if (codeField?.formControl) {
                codeField.formControl.setValue(codeBody);
                codeField.formControl.updateValueAndValidity();
              }
            }
          }, 100);
        },
      });
  }


setIntroducingLawyerValue() {
  const selected = (this.lookupsData?.introducingLawyer?.result ?? []).find(
    (obj: any) => obj.userId == this.formlyModel?.introducingLawyer   
  );
  if (!selected) return null;

  const nameKey =
    this._languageService.getSelectedLanguage() === 'en' ? 'nameEn' : 'nameAr';

  return {
    label: selected[nameKey] ?? selected.name ?? '',
    value: selected.userId,                            
  };
}
getIntroducingLawyerOptions() {
  const field: FieldTypeConfig = findField(
    this.formlyFields,
    'introducingLawyer'
  );
  if (!field) return;

  const nameKey =
    this._languageService.getSelectedLanguage() === 'en' ? 'nameEn' : 'nameAr';

  field.props['optionsArr'] = this.lookupsData?.introducingLawyer?.result ?? [];
  field.props['optionLabel'] = nameKey;
  field.props['optionValue'] = 'userId';              

  if (this.formlyModel?.introducingLawyer) {
    field.props['selectedObj'] = this.setIntroducingLawyerValue();
  }
}

getClientGroupOptions() {
  const field: FieldTypeConfig = findField(this.formlyFields, 'clientGroupId');
  if (!field) return;

  const nameKey =
    this._languageService.getSelectedLanguage() === 'en' ? 'nameEn' : 'nameAr';

  field.props['optionsArr'] = this.lookupsData?.clientGroup?.result ?? [];
  field.props['optionLabel'] = nameKey;                

  if (this.formlyModel?.clientGroupId) {
    field.props['selectedObj'] = this.setClientGroupValue();
  }
}

setClientGroupValue() {
  const selected = (this.lookupsData?.clientGroup?.result ?? []).find(
    (obj: any) => obj.id == this.formlyModel?.clientGroupId
  );
  if (!selected) return null;

  const nameKey =
    this._languageService.getSelectedLanguage() === 'en' ? 'nameEn' : 'nameAr';

  return {
    label: selected[nameKey] ?? selected.name ?? '',
    value: selected.id,
  };
}

  setClientTypeField() {
    const field: FieldTypeConfig = findField(this.formlyFields, 'clientTypeId');
    if (!field) return;

    field.props['optionsArr'] = [
      { label: this._languageService.getTransValue('clients.individual'), value: 1 },
      { label: this._languageService.getTransValue('clients.organization'), value: 2 },
    ];

    if (this.formlyModel?.clientTypeId) {
      field.props['selectedObj'] = this.setClientTypeValue();
    }
  }

  setClientTypeValue() {
    const id = this.formlyModel?.clientTypeId;
    if (!id) return null;

    const labelKey = id === 1 ? 'clients.individual' : 'clients.organization';
    return {
      label: this._languageService.getTransValue(labelKey),
      value: id,
    };
  }
}