import { FormlyFieldConfig } from '@ngx-formly/core';
import { ReportActivity2FilterEditorComponent } from './report-activity-2-filter-editor.component';

export function reportActivityFilterConfig(
  THIS: ReportActivity2FilterEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid md:grid-cols-3 gap-6',
      fieldGroup: [
        {
          key: 'dateFrom',
          type: 'date',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('report.dateFrom'),
          },
        },
        {
          key: 'dateTo',
          type: 'date',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('report.dateTo'),
          },
        },
        {
          key: 'matterIds',
          type: 'multi-select',
          props: {
            virtualScroll: true,
            label: THIS._languageService.getTransValue('matters.title'),
            optionsArr: [],
            loading: true,
            multiple: true,
            emptyMessage: '',
          },
        },
        {
          key: 'activityTypeIds',
          type: 'multi-select',
          props: {
            label: THIS._languageService.getTransValue('matters.activityType'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'multi-select',
          key: 'juriductionsIds',
          props: {
            label: THIS._languageService.getTransValue('matters.jurisdicion'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'multi-select',
          key: 'matterStatusIds',
          props: {
            label: THIS._languageService.getTransValue('matters.matterStatus'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'multi-select',
          key: 'stagesIds',
          props: {
            label: THIS._languageService.getTransValue('matters.stage'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'multi-select',
          key: 'matterTypeIds',
          props: {
            label: THIS._languageService.getTransValue('matters.matterType'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'multi-select',
          key: 'lawyerIds',
          props: {
            label: THIS._languageService.getTransValue('report.lawyer'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'multi-select',
          key: 'clientIds',
          props: {
            label: THIS._languageService.getTransValue(THIS.isInhouse ? 'report.entity' : 'report.client'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'select',
          key: 'law_BranchId',
          props: {
            label: THIS._languageService.getTransValue('common.branch'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'select',
          key: 'printLanguage',
          props: {
            label: THIS._languageService.getTransValue('report.printLanguage'),
            optionsArr: [
              {
                label: THIS._languageService.getTransValue('report.english'),
                value: 1,
              },
              {
                label: THIS._languageService.getTransValue('report.arabic'),
                value: 2,
              },
              {
                label: THIS._languageService.getTransValue('report.french'),
                value: 3,
              },
            ],
          },
          defaultValue:
            THIS._languageService.getSelectedLanguage() === 'en' ? 1 : 2,
          hooks: {
            onInit: (field) => {
              const defaultValue =
                THIS._languageService.getSelectedLanguage() === 'en' ? 1 : 2;
              if (!field.formControl?.value) {
                field.formControl?.setValue(defaultValue, { emitEvent: false });
              }

              field.formControl?.valueChanges.subscribe((value) => {
                if (!value) {
                  delete field.formControl?.parent?.value['printLanguage'];
                }
              });
            },
          },
        },
      ],
      validators: {
        validation: [
          {
            name: 'dateRange',
            options: {
              startDate: 'dateFrom',
              endDate: 'dateTo',
              errorPath: 'dateTo',
            },
          },
        ],
      },
    },
    {
      fieldGroupClassName: 'grid grid-cols-1 py-2',
      fieldGroup: [
        {
          key: 'printTypeId',
          type: 'radio',
          defaultValue: 1,
          props: {
            label: THIS._languageService.getTransValue('report.printType'),
            required: true,
            options: [
              {
                label: THIS._languageService.getTransValue('report.excel'),
                value: 2,
              },
              {
                label: THIS._languageService.getTransValue('report.pdf'),
                value: 1,
              },
            ],
          },
        },
      ],
    },
  ];
}
