import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  OnInit,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChipModule } from 'primeng/chip';
import { DialogService } from 'primeng/dynamicdialog';
import { LanguageService } from 'src/app/@core/services';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { TimesheetAdditionalFilterEditorComponent } from './timesheet-additional-filter-editor/timesheet-additional-filter-editor.component';
import { ObjToArrWithValuesPipe } from 'src/app/@shared/pipes/obj-to-arr-with-values.pipe';
import { Subject, debounceTime, distinctUntilChanged, map, of, switchMap, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-timesheet-filter',
  standalone: true,
  imports: [
    FormlyConfigModule,
    ChipModule,
    SharedButtonComponent,
    TranslateModule,
    SharedSkeletonGridComponent,
    ObjToArrWithValuesPipe,
  ],
  templateUrl: './timesheet-filter.component.html',
  styleUrl: './timesheet-filter.component.scss',
})
export class TimesheetFilterComponent implements OnInit {
  @Output() onFilter = new EventEmitter();
  @Input() lookupsData: any;
  _languageService = inject(LanguageService);
  _dialogService = inject(DialogService);

  formly: FormGroup = new FormGroup({});
  formlyModel: any = {};
  formlyFields: FormlyFieldConfig[] = [];
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initForm();

    this.searchSubject
      .pipe(
        distinctUntilChanged(),
        switchMap((search) => {
          const value = search.trim();

          return value ? timer(400).pipe(map(() => value)) : of('');
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((search) => {
        if (!search) {
          delete this.formlyModel.search;
          this.emitOrReset();
          return;
        }

        this.formlyModel = {
          ...this.formlyModel,
          search,
        };

        this.onFilter.emit({ ...this.formlyModel });
      });
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
                const value = String(this.formly.get('search')?.value ?? '');

                this.searchSubject.next(value);
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
                  TimesheetAdditionalFilterEditorComponent,
                  {
                    header:
                      this._languageService.getTransValue('common.filter'),
                    width: '45vw',
                    data: { formlyModel: this.formlyModel },
                  },
                );
                ref.onClose.subscribe({
                  next: (res) => {
                    if (res?.filters) {
                      this.lookupsData = res.lookupsData;
                      this.formlyModel = {
                        ...this.formly.value,
                        ...res.filters,
                      };
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

  updateFilter(key: string, value?: any) {
    if (!key) return;

    if (key === 'search') {
      delete this.formlyModel.search;
      this.formly.get('search')?.reset();
    } else {
      const fieldValue = this.formlyModel[key];

      if (Array.isArray(fieldValue)) {
        this.formlyModel[key] = fieldValue.filter((item: any) =>
          typeof item === 'object' && value && typeof value === 'object'
            ? item.id !== value.id
            : item !== value,
        );
        if (this.formlyModel[key].length === 0) delete this.formlyModel[key];
      } else {
        delete this.formlyModel[key];
      }
    }

    const currentSearch = this.formly.value?.search;
    if (currentSearch) this.formlyModel.search = currentSearch;
    else delete this.formlyModel.search;

    this.emitOrReset();
  }

  private emitOrReset() {
    const hasFilters =
      Object.keys(this.formlyModel ?? {}).length > 0 ||
      !!this.formly.value?.search;

    if (!hasFilters) {
      this.reset();
    } else {
      this.onFilter.emit({ ...this.formlyModel });
    }
  }

  reset(): void {
    this.searchSubject.next('');

    this.formly.reset({}, { emitEvent: false });
    this.formlyModel = {};

    this.onFilter.emit({});
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  getFilterChips(): { key: string; value: any; label: string }[] {
    const chips: { key: string; value: any; label: string }[] = [];
    if (!this.formlyModel) return chips;

    for (const key in this.formlyModel) {
      const val = this.formlyModel[key];
      if (val == null || val === '' || (Array.isArray(val) && val.length === 0))
        continue;

      if (Array.isArray(val)) {
        for (const item of val) {
          chips.push({
            key,
            value: item,
            label: this.getChipLabel(key, item),
          });
        }
      } else {
        chips.push({
          key,
          value: val,
          label: this.getChipLabel(key, val),
        });
      }
    }
    return chips;
  }

  // getChipLabel(key: string, value: any): string {
  //   if (value && typeof value === 'object') {
  //     return value.label || value.name || value.toString();
  //   }
  //   if (key === 'lawyerId' && this.lookupsData?.lawyers?.result) {
  //     const lawyer = this.lookupsData.lawyers.result.find(
  //       (l: any) => l.id === value,
  //     );
  //     return lawyer?.name || value;
  //   }

  //   if (key === 'taskId' && this.lookupsData?.tasks?.result) {
  //     const task = this.lookupsData.tasks.result.find(
  //       (t: any) => t.id === value,
  //     );
  //     return task?.name || value;
  //   }
  //   if (key === 'matterId' && this.lookupsData?.matterCode?.result) {
  //     const matter = this.lookupsData.matterCode.result.find(
  //       (m: any) => m.id === value,
  //     );
  //     return matter?.name || value;
  //   }

  //   return value;
  // }
  getChipLabel(key: string, value: any): string {
    if (value === null || value === undefined) return '';

    if (typeof value === 'object') {
      return value.name || value.label || value.id || '';
    }

    if (key === 'lawyerId') {
      const lawyer = this.lookupsData?.lawyers?.result?.find(
        (l: any) => String(l.userId ?? l.id) === String(value),
      );

      return lawyer?.name ?? value;
    }

    if (key === 'taskId') {
      const task = this.lookupsData?.tasks?.result?.find(
        (t: any) => String(t.id) === String(value),
      );

      return task?.name ?? value;
    }

    if (key === 'matterId') {
      const matter = this.lookupsData?.matterCode?.result?.find(
        (m: any) => String(m.id) === String(value),
      );

      return matter?.name ?? value;
    }

    return value;
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }
}
