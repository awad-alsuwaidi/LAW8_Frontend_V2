import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DialogService } from 'primeng/dynamicdialog';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';

@Component({
  selector: 'app-lookups-predefined-tasks-filter',
  standalone: true,
  imports: [FormlyConfigModule],
  templateUrl: './lookups-predefined-tasks-filter.component.html',
  styleUrl: './lookups-predefined-tasks-filter.component.scss',
})
export class LookupsPredefinedTasksFilterComponent implements OnInit {
  @Output() onFilter = new EventEmitter();

  private _dialogService = inject(DialogService);

  protected formly: FormGroup = new FormGroup({});
  protected formlyModel: any;
  protected formlyFields: FormlyFieldConfig[] = [];
  private additionalFilterValues: any;
  ngOnInit(): void {
    this.initForm();
  }
  initForm() {
    this.formlyFields = [
      {
        fieldGroupClassName: 'flex justify-between',
        fieldGroup: [
          {
            type: 'input',
            key: 'SearchTerm',
            props: {
              placeholder: 'Search',
              icon: 'icon-search text-grey400',
              input: () => {
                this.formlyModel = { ...this.formly.value };
                this.onFilter.emit(this.formlyModel);
              },
            },
          },
        ],
      },
    ];
  }
}
