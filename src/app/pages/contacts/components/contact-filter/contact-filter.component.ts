import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DialogService } from 'primeng/dynamicdialog';
import { LanguageService } from 'src/app/@core/services';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';

@Component({
  selector: 'app-contact-filter',
  standalone: true,
  imports: [FormlyConfigModule],
  templateUrl: './contact-filter.component.html',
  styleUrl: './contact-filter.component.scss',
})
export class ContactFilterComponent implements OnInit {
  _dialogService = inject(DialogService);
  _languageService = inject(LanguageService);

  onFilter = output();
  filter = input();
  formly: FormGroup = new FormGroup({});
  formlyModel: any;
  formlyFields: FormlyFieldConfig[] = [];
  additionalFilterValues: any;

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.formlyFields = [
      {
        fieldGroupClassName: 'flex justify-between py-6',
        fieldGroup: [
          {
            type: 'input',
            key: 'search',
            props: {
              placeholder: this._languageService.getTransValue('common.search'),
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
