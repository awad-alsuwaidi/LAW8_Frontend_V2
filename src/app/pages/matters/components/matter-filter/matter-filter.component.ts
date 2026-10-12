import { filter } from 'rxjs';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DialogService } from 'primeng/dynamicdialog';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { MatterAdditionalFilterEditorComponent } from '../matter-additional-filter-editor/matter-additional-filter-editor.component';
import { ChipModule } from 'primeng/chip';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-matter-filter',
  standalone: true,
  imports: [
    FormlyConfigModule,
    ChipModule,
    SharedButtonComponent,
    TranslateModule,
  ],
  templateUrl: './matter-filter.component.html',
  styleUrl: './matter-filter.component.scss',
})
export class MatterFilterComponent implements OnInit {
  @Output() onFilter = new EventEmitter();

  _dialogService = inject(DialogService);

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
        fieldGroupClassName: 'flex justify-between',
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
              label: 'Filter',
              icon: 'icon-sort !text-xl !leading-4 mt-1',
              class:
                '!p-2 border border-grey200 !text-textSecondary !text-sm !font-medium flex',
              onClick: () => {
                const ref = this._dialogService.open(
                  MatterAdditionalFilterEditorComponent,
                  {
                    header: 'Filter',
                    width: '45vw',
                    data: { formlyModel: this.formlyModel },
                  }
                );
                ref.onClose.subscribe({
                  next: (res) => {
                    if (res) {
                      this.formlyModel = { ...this.formly.value, ...res };
                      console.log('this.formlyModel', this.formlyModel);
                      const keysWithValues = Object.values(res).filter(
                        (value) => value !== undefined && value !== null
                      );
                      this.additionalFilterValues = keysWithValues;
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
    this.additionalFilterValues = [];
    this.onFilter.emit(this.formlyModel);
  }
  updateFilter(value: any) {
    this.additionalFilterValues = this.additionalFilterValues.filter(
      (val: any) => val != value
    );
    const key: string = this.findKeyByValue(this.formlyModel, value) || '';
    delete this.formlyModel[key];
    this.onFilter.emit(this.formlyModel);
  }
  findKeyByValue(obj: Record<string, any>, value: any): string | undefined {
    return Object.keys(obj).find((key) => obj[key] === value);
  }
}
