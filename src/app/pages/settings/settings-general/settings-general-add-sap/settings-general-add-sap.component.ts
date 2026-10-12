import { Component, OnDestroy, OnInit } from '@angular/core';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';

@Component({
  selector: 'app-settings-general-add-sap',
  standalone: true,
  imports: [
    SharedModule,
    FormlyConfigModule,
    SharedButtonComponent
  ],
  templateUrl: './settings-general-add-sap.component.html',
  styleUrl: './settings-general-add-sap.component.scss'
})
export class SettingsGeneralAddSapComponent extends FormBaseClass implements OnInit,OnDestroy {
  
  ngOnInit(): void {
    this.initForm()
  }
  override initForm(): void {
    this.formlyFields = [
      {
        type: 'input',
        key: 'MatterId',
        props: {
          required: true,
        }
      }
    ]
  }
  override onSubmit(): void {
    if (this.formly.invalid) return;
    this._apiService.post(API_Config.matters.sendMatterToSAP,{}, this.formlyModel)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this._toastrNotifiService.displaySuccess(res.message);
            this._dynamicDialogRef.close()
          }
        }
      });
  }
  cancel() {
    this._dynamicDialogRef.close()
  }
  ngOnDestroy(): void {
   this._unsubscribe.destroy();
  }
}
