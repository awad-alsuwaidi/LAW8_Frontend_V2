import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
} from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bills-filter-editor',
  standalone: true,
  imports: [FormlyConfigModule, SharedSkeletonGridComponent],
  templateUrl: './bills-filter-editor.component.html',
  styleUrl: './bills-filter-editor.component.scss',
})
export class BillsFilterEditorComponent
  extends FormBaseClass
  implements OnInit
{
  cdr = inject(ChangeDetectorRef);
  onFilter = output();
  loading: InputSignal<boolean> = input(false);
  isInhouse = environment.brand === 'inhouse';

  ngOnInit(): void {
    this.initForm();
    this.getLookupsData();
  }

  override getLookupsData(): void {
    this.isLoading = true;
    combineLatest({
      clientList: this._apiService.get(API_Config.general.getClients),
      allMatters: this._apiService.get(API_Config.general.getMatterCodes),
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res) => {
          this.lookupsData = res;

          const clientField: FormlyFieldConfig = findField(
            this.formlyFields,
            'ClientId'
          );
          if (clientField?.props) {
            clientField.props['optionsArr'] = getOptionsArray(
              res.clientList?.result,
              'id',
              'name'
            );
          }

          const matterField: FormlyFieldConfig = findField(
            this.formlyFields,
            'MatterId'
          );
          if (matterField?.props) {
            matterField.props['optionsArr'] = getOptionsArray(
              res.allMatters?.result,
              'id',
              'name'
            );
            matterField.props['disabled'] = false; 
          }
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
            defaultValue: new Date().toISOString().split('T')[0],
            className: 'w-full',
            props: {
              label: this._languageService.getTransValue('billing.startDate'),
            },
          },
          {
            key: 'ToDate',
            type: 'date',
            defaultValue: new Date().toISOString().split('T')[0],
            className: 'w-full',
            props: {
              label: this._languageService.getTransValue('billing.endDate'),
            },
          },
      {
  key: 'ClientId',
  type: 'select',
  props: {
    label: this._languageService.getTransValue(
      this.isInhouse ? 'common.entity1' : 'common.client'
    ),
    placeholder: this._languageService.getTransValue(
      this.isInhouse
        ? 'common.selectEntity'
        : 'common.selectClient'
    ),
    optionsArr: this.lookupsData?.clientList?.result || [],
    onChange: () => this.getMattersByClientId(),
  },
  expressionProperties: {
    'props.disabled': () =>
      this.isLoading || !this.lookupsData?.clientList?.result?.length,
  },
},
          {
            key: 'MatterId',
            type: 'select',
            props: {
              label: 'Matter',
              virtualScroll: false,
              placeholder: 'Select matter...',
              optionsArr:
                this.lookupsData?.mattersByClient?.[
                  this.formlyModel?.ClientId
                ] || [],
            },
            expressionProperties: {
              'props.disabled': () =>
                this.isLoading ||
                !this.lookupsData?.mattersByClient?.[
                  this.formlyModel?.ClientId
                ],
            },
          },
        ],
        validators: {
          validation: [
            {
              name: 'dateRange',
              options: {
                startDate: 'FromDate',
                endDate: 'ToDate',
                errorPath: 'ToDate',
              },
            },
          ],
        },
      },
      {
        fieldGroupClassName:
          'flex flex-col sm:flex-row gap-4 justify-end mt-4 bg-white p-6 rounded-2xl shadow-md',
        fieldGroup: [
          {
            type: 'button',
            props: {
              label: 'Reset',
              class:
                'bg-white text-grey500 border border-grey500 hover:bg-grey50 !px-8 !py-3 rounded-md w-full sm:w-auto text-sm font-medium transition',
              onClick: () => this.onReset(),
            },
          },
          {
            key: 'LoadBtn',
            type: 'button',
            props: {
              label: 'Load',
              isLoading: false,
              disabled: false,
              class:
                'bg-primary text-white hover:bg-primary-dark !px-8 !py-3 rounded-md w-full sm:w-auto text-sm font-medium transition',
              onClick: () => this.onSubmit(),
            },
          },
        ],
      },
    ];
  }

 effect = effect(() => {
    const btn = findField(this.formlyFields, 'LoadBtn');
    if (btn?.props) {
      btn.props['isLoading'] = this.loading();
      btn.props['disabled'] = this.loading();
    }
  });

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
            if (matterField?.props) {
              matterField.props['optionsArr'] = getOptionsArray(
                res.result,
                'id',
                'name'
              );

              if (matterField.formControl) {
                matterField.formControl.setValue(null);
                matterField.formControl.updateValueAndValidity();
              }
              this.cdr.detectChanges();
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
