import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DialogService } from 'primeng/dynamicdialog';
import { LanguageService } from 'src/app/@core/services';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';

@Component({
  selector: 'app-security-users-filter',
  standalone: true,
  imports: [FormlyConfigModule],
  templateUrl: './security-users-filter.component.html',
  styleUrl: './security-users-filter.component.scss',
})
export class SecurityUsersFilterComponent implements OnInit {
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
          // {
          //   type: 'button',
          //   props: {
          //     label: this._languageService.getTransValue('common.filter'),
          //     icon: 'icon-sort !text-xl !leading-4 mt-1',
          //     class: '!p-2 border border-grey200 !text-textSecondary !text-sm !font-medium flex',
          //     onClick: () => {
          //       const ref = this._dialogService.open(TmSessionFilterAdditionalEditorComponent, {
          //         header: this._languageService.getTransValue('common.advancedFilter'),
          //         width: '45vw',
          //         data: { formlyModel: this.filter() }
          //       });
          //       ref.onClose.subscribe({
          //         next: (res) => {
          //           if (res) {
          //             this.formlyModel = { ...this.formly.value, ...res };
          //             this.onFilter.emit(this.formlyModel);
          //           }
          //         }
          //       });
          //     }
          //   }
          // }
        ],
      },
    ];
  }
}
