import { inject, InjectionToken } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LanguageService,
  StorageService,
  ToastrNotifiService,
} from '@core/services';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { UnsubscribeService } from '@shared/services/unsubscribe/unsubscribe.service';
import { ApiService } from '../api/api.service';

export const CUSTOM_UNSUBSCRIBE_TOKEN = new InjectionToken<UnsubscribeService>(
  'CustomUnsubscribeService',
  {
    providedIn: 'root',
    factory: () => new UnsubscribeService(),
  }
);

export abstract class FormBaseClass {
  isLoading: boolean = false;
  isSubmitted: boolean = false;
  formly: FormGroup = new FormGroup({});
  formlyModel: any = {};
  formlyFields: FormlyFieldConfig[] = [];
  formlyOptions: FormlyFormOptions = {};
  lookupsData: any = {};
  _toastrNotifiService = inject(ToastrNotifiService);
  _languageService = inject(LanguageService);
  _dialogService = inject(DialogService);
  _dynamicDialogConfig = inject(DynamicDialogConfig);
  _dynamicDialogRef = inject(DynamicDialogRef);
  _storageService = inject(StorageService);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _apiService = inject(ApiService);
  _unsubscribe = inject(CUSTOM_UNSUBSCRIBE_TOKEN);
  abstract initForm(): void;
  getLookupsData(): void {}

  getData(): void {}

  abstract onSubmit(): void;
}
