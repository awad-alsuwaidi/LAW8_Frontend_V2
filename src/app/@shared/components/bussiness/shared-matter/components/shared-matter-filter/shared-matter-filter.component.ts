import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DialogService } from 'primeng/dynamicdialog';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedMatterAdditionalFilterEditorComponent } from '../shared-matter-additional-filter-editor/shared-matter-additional-filter-editor.component';
import { ChipModule } from 'primeng/chip';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/@core/services';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';

@Component({
  selector: 'app-shared-matter-filter',
  standalone: true,
  imports: [
    FormlyConfigModule,
    ChipModule,
    SharedButtonComponent,
    TranslateModule,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './shared-matter-filter.component.html',
  styleUrl: './shared-matter-filter.component.scss',
})
export class SharedMatterFilterComponent implements OnInit {
  @Output() onFilter = new EventEmitter();
  _languageService = inject(LanguageService);
  _dialogService = inject(DialogService);

  formly: FormGroup = new FormGroup({});
  formlyModel: any = {};
  formlyFields: FormlyFieldConfig[] = [];

  additionalFilterValues: any[] = [];

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.formlyFields = [
      {
        fieldGroupClassName: 'flex justify-between gap-6',
        fieldGroup: [
          {
            type: 'input',
            key: 'search',
            props: {
              placeholder: 'Search',
              icon: 'icon-search text-grey400',
              input: () => {
                this.formlyModel = { ...this.formly.value };
                this.onFilter.emit(this.formlyModel);
              },
            },
          },
          {
            type: 'button',
            props: {
              label: this._languageService.getTransValue('common.filter'),
              icon: 'icon-sort !text-xl !leading-4 mt-1',
              class:
                '!p-2 border border-grey200 !text-textSecondary !text-sm !font-medium flex',
              onClick: () => {
                const ref = this._dialogService.open(
                  SharedMatterAdditionalFilterEditorComponent,
                  {
                    header:
                      this._languageService.getTransValue('common.filter'),
                    width: '45vw',
                    data: { formlyModel: this.formlyModel },
                  },
                );
                ref.onClose.subscribe({
                  next: (res) => {
                    if (res) {
                      this.formlyModel = { ...this.formly.value, ...res };

                      this.additionalFilterValues = Object.entries(res)
                        .filter(
                          ([_, value]) => value !== undefined && value !== null,
                        )
                        .map(([key, value]: [string, any]) => {
                          let label = '';
                          if (typeof value === 'object' && value !== null) {
                            label =
                              value.name ||
                              value.nameEn ||
                              value.nameAr ||
                              value.clientName ||
                              value.label ||
                              '';
                          } else {
                            label = String(value);
                          }
                          return { key, value, label };
                        });

                      this.onFilter.emit(this.formlyModel);
                    }
                  },
                });
              },
            },
          },
        ],
      },
    ];
  }

  reset() {
    this.formly.reset();
    this.formlyModel = {};
    this.additionalFilterValues = [];
    this.onFilter.emit(this.formlyModel);
  }

  updateFilter(item: any) {
    this.additionalFilterValues = this.additionalFilterValues.filter(
      (val: any) => val.key !== item.key,
    );

    if (this.formlyModel) {
      delete this.formlyModel[item.key];
    }

    this.onFilter.emit(this.formlyModel);
  }
}
