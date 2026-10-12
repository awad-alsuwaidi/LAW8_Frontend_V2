import { Component, OnInit } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { settingsGeneralFormlyConfig } from './settings-general-formly.config';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { finalize } from 'rxjs';
import { SettingsGeneralAddSapComponent } from './settings-general-add-sap/settings-general-add-sap.component';

@Component({
  selector: 'app-settings-general',
  standalone: true,
  imports: [
    SharedButtonComponent,
    SharedModule,
    FormlyConfigModule
  ],
  templateUrl: './settings-general.component.html',
  styleUrl: './settings-general.component.scss'
})
export class SettingsGeneralComponent extends FormBaseClass implements OnInit {

  ngOnInit(): void {
    // TODO: Add initialization logic here
    this.initForm();
  }

  initForm(): void {
    this.formlyFields = settingsGeneralFormlyConfig(this);
    this.setFormValues()
  }

  setFormValues() {
    this._apiService
      .post(API_Config.setting.get, null)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          this.formlyModel = res['result'];
        },
      });
  }
  AddToSap(){
    this._dialogService.open(SettingsGeneralAddSapComponent,{
      header:'Send Matter To SAP',
      width:'30vw'
    })
  }
  reset() {
    this.formly.reset();
    this.formlyModel = {};
  }
  onSubmit(): void {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this._apiService
      .post(API_Config.setting.create, this.formlyModel)
      .pipe(
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this._toastrNotifiService.displaySuccess(res.message);
          }
        }
      });
  }

}
