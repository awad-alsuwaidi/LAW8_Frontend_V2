import { Component, OnInit, output } from '@angular/core';
import { combineLatest } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { getEnumKeys } from 'src/app/@core/utilities/functions/enum-keys';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { DashboardDuration } from 'src/app/pages/dashboard/enums/dashboard-duration';

@Component({
  selector: 'app-task-management-filter-activity-editor',
  standalone: true,
  imports: [FormlyConfigModule],
  templateUrl: './task-management-filter-activity-editor.component.html',
  styleUrl: './task-management-filter-activity-editor.component.scss',
})
export class TaskManagementFilterActivityEditorComponent
  extends FormBaseClass
  implements OnInit
{
  onFilter = output();
  ngOnInit(): void {
    this.getLookupsData();
  }
  override getLookupsData(): void {
    combineLatest({
      activityType: this._apiService.get(API_Config.general.getActivityType),
    })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.lookupsData = res;
          this.lookupsData.activityType.result =
            this.lookupsData.activityType.result.filter(
              (obj: any) => obj.id != 1
            );
          this.initForm();
        },
      });
  }
  initForm(): void {
    this.formlyFields = [
      {
        fieldGroupClassName: 'flex justify-between gap-4 w-full',
        fieldGroup: [
          {
            type: 'select-button',
            key: 'beriod',
            props: {
              optionArr: getEnumKeys(DashboardDuration).map((value, index) => ({
                label: this._languageService.getTransValue(`common.${value}`),
                value: index + 1,
              })),
              onChange: () => {
                this.onSubmit();
              },
            },
          },
          {
            type: 'select',
            key: 'activityType',
            defaultValue: 2,
            className: 'p-dropdown-sm',
            props: {
              optionsArr: getOptionsArray(
                this.lookupsData.activityType?.result,
                'id',
                'name'
              ),
              showClear: false,
              onChange: () => {
                this.onSubmit();
              },
            },
          },
        ],
      },
    ];
    this.setFormData();
  }
  setFormData() {
    this.formlyModel.beriod = DashboardDuration.today; // Default to 'Today'
    // Wait for fields to initialize, then trigger onChange manually
    setTimeout(() => {
      const beriodField = findField(this.formlyFields, 'beriod');

      if (beriodField?.props?.onChange) {
        beriodField.props.onChange();
      }
    });
  }
  onSubmit(): void {
    this.onFilter.emit(this.formlyModel);
  }
}
