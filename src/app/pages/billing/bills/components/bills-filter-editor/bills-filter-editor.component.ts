import { Component, input, InputSignal, OnInit, output } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
@Component({
  selector: 'app-bills-filter-editor',
  standalone: true,
  imports: [FormlyConfigModule],
  templateUrl: './bills-filter-editor.component.html',
  styleUrl: './bills-filter-editor.component.scss',
})
export class BillsFilterEditorComponent
  extends FormBaseClass
  implements OnInit
{
  onFilter = output();
  loading: InputSignal<boolean> = input(false);
  ngOnInit(): void {
    this.getLookupsData();
  }
  override getLookupsData(): void {
    this.isLoading = true;
    combineLatest({
      clientList: this._apiService.get(API_Config.general.getClients),
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res) => {
          this.lookupsData = res;
          this.initForm();
        },
      });
  }
  override initForm(): void {
    this.formlyFields = [
      {
        fieldGroupClassName:
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-6 rounded-2xl shadow-md',
        fieldGroup: [
          {
            key: 'FromDate',
            type: 'date',
            defaultValue: new Date(),
            className: 'w-full',
            props: {
              label: this._languageService.getTransValue('billing.startDate'),
            },
          },
          {
            key: 'ToDate',
            type: 'date',
            defaultValue: new Date(),
            className: 'w-full',
            props: {
              label: this._languageService.getTransValue('billing.endDate'),
            },
          },
          {
            key: 'ClientId',
            type: 'select',
            className: 'w-full',
            props: {
              label: this._languageService.getTransValue('billing.client'),
              optionsArr: getOptionsArray(
                this.lookupsData.clientList?.result,
                'id',
                'name'
              ),
              onChange: () => this.getMattersByClientId(),
            },
          },
          {
            key: 'MatterId',
            type: 'select',
            className: 'w-full',
            props: {
              label: this._languageService.getTransValue('billing.matter'),
              virtualScroll: false,
            },
          },
          {
            fieldGroupClassName:
              'flex flex-col sm:flex-row gap-4 justify-end col-span-1 sm:col-span-2 lg:col-span-3 mt-4',
            fieldGroup: [
              {
                type: 'button',
                props: {
                  label: 'Reset',
                  class:
                    'bg-white text-grey500 border border-grey500 hover:bg-grey50 !px-6 !py-3 rounded-md w-full sm:w-auto text-sm font-medium transition',
                  onClick: () => this.onReset(),
                },
              },
              {
                type: 'button',
                props: {
                  label: 'Load',
                  class:
                    'bg-primary text-white hover:bg-primary-dark !px-6 !py-3 rounded-md w-full sm:w-auto text-sm font-medium transition',
                  onClick: () => this.onSubmit(),
                },
              },
            ],
          },
        ],
      },
    ];
  }
  getMattersByClientId() {
    const params = { ClientId: this.formlyModel.ClientId };
    this._apiService
      .get(API_Config.general.getMattersByClientId, params)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            const matterField: FormlyFieldConfig = findField(
              this.formlyFields,
              'MatterId'
            );
            console.log('matterField', matterField);
            if (matterField && matterField.props) {
              matterField.props['optionsArr'] = [];
              matterField.props['optionsArr'] = getOptionsArray(
                res.result,
                'id',
                'name'
              );
            }
          }
        },
      });
  }
  onReset() {
    this.formly.reset();
    this.formlyModel = null;
  }
  override onSubmit(): void {
    this.onFilter.emit(this.formlyModel);
  }
}
