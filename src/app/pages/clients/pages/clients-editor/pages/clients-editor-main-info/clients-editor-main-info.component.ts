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

@Component({
  selector: 'app-clients-editor-main-info',
  standalone: true,
  imports: [FormlyConfigModule, TranslateModule],
  templateUrl: './clients-editor-main-info.component.html',
  styleUrl: './clients-editor-main-info.component.scss',
})
export class ClientsEditorMainInfoComponent implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    this.getClientGroupOptions();
    this.getIntroducingLawyerOptions();
    this.setClientTypeField();
  }
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
  getLookupsData() {
    const endpoints = {
      clientCode: this._apiService.post(
        API_Config.client.getOrNewClientCode,
        null,
      ),
      introducingLawyer: this._apiService.get(
        API_Config.general.getLawyerShort,
      ),
      clientGroup: this._apiService.get(API_Config.general.getClientGroups, {
        orderByDirection: 'ASC',
      }),
    };
    const { clientCode, ...remainingEndpoints } = endpoints;
    const apis = this._router.url.includes('add')
      ? endpoints
      : remainingEndpoints;
    combineLatest(apis)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res) => {
        this.lookupsData = res;
        this.formlyFields = clientsEditorMainInfoFormlyFieldsConfig(this);
        setTimeout(() => {
          this.getClientGroupOptions();
          this.getIntroducingLawyerOptions();
          this.setClientTypeField();
        }, 100);
      });
  }

  setClientTypeField() {
    const field: FieldTypeConfig = findField(this.formlyFields, 'clientType');
    if (!field) return;
    field.props['optionsArr'] = [
      {
        label: this._languageService.getTransValue('clients.individual'),
        value: 'Individual',
      },
      {
        label: this._languageService.getTransValue('clients.organization'),
        value: 'Organization',
      },
    ];

    if (this.formlyModel?.clientType) {
      field.props['selectedObj'] = this.setClientTypeValue();
    }
  }

  setClientTypeValue() {
    const type = this.formlyModel?.clientType;
    if (!type) return null;

    const map: Record<string, string> = {
      Individual: 'clients.individual',
      Organization: 'clients.organization',
    };

    const translationKey = map[type];
    if (!translationKey) return null;

    return {
      label: this._languageService.getTransValue(translationKey),
      value: type,
    };
  }

  getClientGroupOptions() {
    const clientGroupField: FieldTypeConfig = findField(
      this.formlyFields,
      'clientGroupId',
    );
    if (clientGroupField) {
      clientGroupField.props['optionsArr'] =
        this.lookupsData?.clientGroup?.result;

      if (this.formlyModel?.clientGroupId) {
        clientGroupField.props['selectedObj'] = this.setClientGroupValue();
      }
    }
  }
  getIntroducingLawyerOptions() {
    const introducingLawyerField: FieldTypeConfig = findField(
      this.formlyFields,
      'introducingLawyer',
    );
    if (introducingLawyerField) {
      introducingLawyerField.props['optionsArr'] =
        this.lookupsData?.introducingLawyer?.result;
      if (this.formlyModel?.introducingLawyer) {
        introducingLawyerField.props['selectedObj'] =
          this.setIntroducingLawyerValue();
      }
    }
  }

  setClientGroupValue() {
    const selectedClientGroup = this.lookupsData?.clientGroup?.result.find(
      (obj: any) => obj.id == this.formlyModel?.clientGroupId,
    );
    if (!selectedClientGroup) return null;
    return {
      label: selectedClientGroup?.name,
      value: selectedClientGroup?.id,
    };
  }
  setIntroducingLawyerValue() {
    const selectedIntroducingLawyer =
      this.lookupsData?.introducingLawyer?.result.find(
        (obj: any) => obj.id == this.formlyModel?.introducingLawyer,
      );
    if (!selectedIntroducingLawyer) return null;
    return {
      label: selectedIntroducingLawyer?.name,
      value: selectedIntroducingLawyer?.id,
    };
  }
}
