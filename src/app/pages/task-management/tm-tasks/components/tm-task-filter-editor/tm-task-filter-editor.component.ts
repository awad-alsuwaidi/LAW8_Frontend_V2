import { Component, OnInit, output } from '@angular/core';
import { combineLatest } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { getEnumKeys } from 'src/app/@core/utilities/functions/enum-keys';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { MatterTaskPriority } from 'src/app/pages/matters/enums/matter-taskPriority';
import { DashboardDuration } from 'src/app/pages/dashboard/enums/dashboard-duration';

@Component({
  selector: 'app-tm-task-filter-editor',
  standalone: true,
  imports: [
    FormlyConfigModule
  ],
  templateUrl: './tm-task-filter-editor.component.html',
  styleUrl: './tm-task-filter-editor.component.scss'
})
export class TmTaskFilterEditorComponent extends FormBaseClass implements OnInit {
  onFilter = output()
  ngOnInit(): void {
    this.getLookupsData();
  }
  override getLookupsData(): void {
    combineLatest({
      taskPriority: this._apiService.get(API_Config.general.getTaskPriority),
    })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res) => {
          this.lookupsData = res;
          this.initForm();
        },
      });
  }
  initForm(): void {
    this.formlyFields = [
      {
        fieldGroupClassName: 'flex justify-between gap-4',
        fieldGroup: [
          {
            type: 'select-button',
            key: 'beriod',
            props: {
              optionArr: getEnumKeys(DashboardDuration).map((value, index) => ({ label: this._languageService.getTransValue(`common.${value}`), value: index + 1 })),
              onChange: () => {
               this.onSubmit()
              }
            }
          },
          {
            type: 'select',
            key: 'StatusId',
            className:'p-dropdown-sm',
            props: {
              optionsArr: getOptionsArray(this.lookupsData.taskPriority?.result, 'id', 'name'),
              showClear:false,
              onChange: () => {
               this.onSubmit()
              }
            }
          },
        
        ]
      }

    ]
    this.setFormData()
  }
 setFormData() {
    this.formlyModel.beriod = DashboardDuration.Today;// Default to 'Today'
    this.formlyModel.StatusId = MatterTaskPriority.Urgent;// Default to 'Urgent'
    // Wait for fields to initialize, then trigger onChange manually
    setTimeout(() => {
      const beriodField = findField(this.formlyFields, 'beriod');
      const priorityField = findField(this.formlyFields, 'StatusId');
      if (beriodField?.props?.onChange && priorityField?.props?.onChange) {
        beriodField.props.onChange();
        priorityField.props.onChange()
      }
    });
  }
  onSubmit(): void {
    this.onFilter.emit(this.formlyModel);
  }

}
