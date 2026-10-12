import { ChangeDetectionStrategy, Component, OnInit, output } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { getEnumKeys } from 'src/app/@core/utilities/functions/enum-keys';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { DashboardDuration } from 'src/app/pages/dashboard/enums/dashboard-duration';
import { DashboardDurationTimeSheet } from 'src/app/pages/dashboard/enums/dashboard-durations-timesheet';

@Component({
  selector: 'app-dashboard-durationtimesheet-filter-editor',
  standalone: true,
  imports: [
    FormlyConfigModule
  ],
  templateUrl: './dashboard-durationtimesheet-filter-editor.component.html',
  styleUrl: './dashboard-durationtimesheet-filter-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class DashboardDurationtimesheetFilterEditorComponent extends FormBaseClass implements OnInit {
  onFilter = output()
  ngOnInit(): void {
    this.initForm();
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
              optionArr: getEnumKeys(DashboardDurationTimeSheet).map((value, index) => ({ label: this._languageService.getTransValue(`common.${value}`), value: index + 1 })),
              onChange: () => {
                this.onSubmit()
              }
            }
          }
        ]
      }

    ]

    this.setFormData()
  }

  setFormData() {
  }

  onSubmit(): void {
    this.onFilter.emit(this.formlyModel);
  }
}
