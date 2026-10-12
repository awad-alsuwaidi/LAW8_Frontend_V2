import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';

@Component({
  selector: 'app-settings-taxes',
  standalone: true,
  imports: [SharedButtonComponent, SharedModule, FormlyConfigModule],
  templateUrl: './settings-taxes.component.html',
  styleUrl: './settings-taxes.component.scss',
})
export class SettingsTaxesComponent extends FormBaseClass implements OnInit {
  ngOnInit(): void {
    // TODO: Add initialization logic here
    this.getLookupsData();
  }
  override getLookupsData(): void {
    this._apiService
      .get(API_Config.general.getAllCurrencies)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          this.lookupsData = res;
          this.initForm();
        },
      });
  }
  initForm(): void {
    this.formlyFields = [
      {
        fieldGroupClassName:
          'grid md:grid-cols-3 gap-4 bg-white p-6 rounded-lg mb-4',
        fieldGroup: [
          {
            template: `<h5 class="text-grey500 mb-4 text-lg font-bold"> ${this._languageService.getTransValue(
              // 'setting.systemCurrency'
              'Taxes'
            )}</h5>`,
            className: 'col-span-3',
          },
          {
            className: 'col-span-2',
            fieldGroupClassName: 'grid md:grid-cols-2 gap-4',
            fieldGroup: [
              {
                type: 'switch',
                key: 'isTaxes',
                defaultValue: false,
                className: 'col-span-3',
                props: {
                  label: this._languageService.getTransValue('Taxes'),
                },
              },
              {
                className: 'col-span-2',
                fieldGroupClassName: 'grid md:grid-cols-2 gap-4',
                fieldGroup: [
                  {
                    type: 'input',

                    key: 'fees',
                    defaultValue: '0',
                    props: {
                      label:
                        this._languageService.getTransValue('setting.fees'),
                      pKeyFilter: 'int',
                    },
                  },
                  {
                    type: 'input',

                    key: 'disbursements',
                    defaultValue: '0',
                    props: {
                      label: this._languageService.getTransValue(
                        'setting.disbursements'
                      ),
                      pKeyFilter: 'int',
                    },
                  },
                ],
                expressions: {
                  hide: '!model.isTaxes',
                },
              },
            ],
          },
        ],
      },
    ];
    this.setFormValues();
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
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this._toastrNotifiService.displaySuccess(res.message);
          }
        },
      });
  }
}
