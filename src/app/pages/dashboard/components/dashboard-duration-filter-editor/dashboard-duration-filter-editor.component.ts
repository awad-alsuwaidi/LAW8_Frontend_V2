import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  output,
} from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { DashboardDuration } from '../../enums/dashboard-duration';
import { getEnumKeys } from 'src/app/@core/utilities/functions/enum-keys';
import { findField } from 'src/app/@core/utilities/functions/find-field';

@Component({
  selector: 'app-dashboard-duration-filter-editor',
  standalone: true,
  imports: [FormlyConfigModule],
  templateUrl: './dashboard-duration-filter-editor.component.html',
  styleUrl: './dashboard-duration-filter-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardDurationFilterEditorComponent
  extends FormBaseClass
  implements OnInit
{
  onFilter = output();
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
              optionArr: getEnumKeys(DashboardDuration).map((value, index) => ({
                label: this._languageService.getTransValue(`common.${value}`),
                value: index + 1,
              })),
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
    setTimeout(() => {
      const field = findField(this.formlyFields, 'beriod');
      if (field?.props?.onChange) {
        field.props.onChange();
      }
    });
  }

  onSubmit(): void {
    this.onFilter.emit(this.formlyModel);
  }
}
