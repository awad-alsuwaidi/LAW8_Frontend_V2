import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';

@Component({
  selector: 'app-settings-company-logo-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    SharedModule
  ],
  templateUrl: './settings-company-logo-editor.component.html',
  styleUrl: './settings-company-logo-editor.component.scss'
})
export class SettingsCompanyLogoEditorComponent extends FormBaseClass implements OnInit, OnDestroy {

  ngOnInit(): void {
    // TODO: Add initialization logic here
    this.setFormData();
  }


  initForm(): void {
    this.formlyFields = [

      {
        fieldGroupClassName: 'grid md:grid-cols-3 gap-4 bg-white p-6 rounded-lg mb-4',
        fieldGroup: [
          {
            className: 'md:col-span-3',

            template: `<h5 class="text-grey500 mb-8 text-lg font-bold "> ${this._languageService.getTransValue(
              'Company Logo'
            )}</h5>`,
          },
          {
            type: 'switch',
            key: 'IsLogo',
            defaultValue: true,
            className: 'col-span-3',
            props: {
              label: this._languageService.getTransValue('Activate Company Logo'),
            },

          },
          {
            type: 'inline-upload',
            key: 'Logo',
            props: {
              label: this._languageService.getTransValue('Company Logo'),
              returnType: 'file',
            },
            expressions: {
              'hide': '!model.IsLogo',
            },
          },
        ]
      }
    ]
    
  }

  setFormData(){
    this._apiService.get(API_Config.setting.getLogo).pipe(
      this._unsubscribe.takeUntilDestroy()
    ).subscribe({
      next: (res: ApiRes) => {
        if (res.isSuccess) {
          this.formlyModel = res.result;
          this.formlyModel={...this.formlyModel,Logo: res.result.logoPath};
          this.initForm();
        }
      }
    })
  }
  onSubmit(): void {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      return;
    }
    this.isSubmitted = true;
    let formData = new FormData();
    for (const [key, value] of Object.entries(this.formlyModel)) {
      if (key === 'Logo') continue
      formData.append(key, `${value}`);
    }
    formData.append(`Logo`, this.formlyModel.Logo);
    this._apiService.post(API_Config.setting.addLogo,formData).pipe(
      finalize(() => this.isLoading = false),
      this._unsubscribe.takeUntilDestroy(),
    ).subscribe({
      next: (res: ApiRes) => {
        if (res.isSuccess) {
          this._toastrNotifiService.displaySuccess(res.message);
        }
      }
    }
    )
  }
  ngOnDestroy(): void {
    this._unsubscribe.destroy()
  }

}
