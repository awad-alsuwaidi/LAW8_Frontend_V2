import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChipModule } from 'primeng/chip';
import { DialogService } from 'primeng/dynamicdialog';
import { LanguageService } from 'src/app/@core/services';
import { SharedMatterAdditionalFilterEditorComponent } from 'src/app/@shared/components/bussiness/shared-matter/components/shared-matter-additional-filter-editor/shared-matter-additional-filter-editor.component';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { FeesAdditionalFilterEditorComponent } from './fees-additional-filter-editor/fees-additional-filter-editor.component';
import { ObjToArrWithValuesPipe } from 'src/app/@shared/pipes/obj-to-arr-with-values.pipe';

@Component({
  selector: 'app-fees-filter',
  standalone: true,
  imports: [
    FormlyConfigModule,
    ChipModule,
    SharedButtonComponent,
    TranslateModule,
    SharedSkeletonGridComponent,
    ObjToArrWithValuesPipe,
  ],
  templateUrl: './fees-filter.component.html',
  styleUrl: './fees-filter.component.scss',
})
export class FeesFilterComponent {
  @Output() onFilter = new EventEmitter();
  _languageService = inject(LanguageService);

  _dialogService = inject(DialogService);

  formly: FormGroup = new FormGroup({});
  formlyModel: any;
  formlyFields: FormlyFieldConfig[] = [];
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
                  FeesAdditionalFilterEditorComponent,
                  {
                    header:
                      this._languageService.getTransValue('common.filter'),
                    width: '45vw',
                    data: { formlyModel: this.formlyModel },
                  }
                );
                ref.onClose.subscribe({
                  next: (res) => {
                    if (res) {
                      this.formlyModel = { ...this.formly.value, ...res };

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
    this.formlyModel = null;
    this.onFilter.emit(this.formlyModel);
  }
  updateFilter(value: any) {
    const key: string = this.findKeyByValue(this.formlyModel, value) || '';
    delete this.formlyModel[key];
    this.onFilter.emit(this.formlyModel);
  }
  findKeyByValue(obj: Record<string, any>, value: any): string | undefined {
    return Object.keys(obj).find((key) => obj[key] === value);
  }
}
