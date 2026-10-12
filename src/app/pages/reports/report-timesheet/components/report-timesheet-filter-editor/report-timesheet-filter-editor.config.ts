import { FormlyFieldConfig } from '@ngx-formly/core';
import { ReportTimesheetFilterEditorComponent } from './report-timesheet-filter-editor.component';

export function reportTimesheetFilterEditorConfig(
  THIS: ReportTimesheetFilterEditorComponent
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
            required: true,
          },
        },
        {
          key: 'dateTo',
          type: 'date',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('report.dateTo'),
            required: true,
          },
        },
        {
          key: 'mtrNo',
          type: 'select',
          props: {
            virtualScroll: true,
            label: THIS._languageService.getTransValue('matters.title'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'multi-select',
          key: 'laywersIds',
          props: {
            label: THIS._languageService.getTransValue('report.lawyer'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'select',
          key: 'clientIds',
          props: {
            label: THIS._languageService.getTransValue(THIS.isInhouse ? 'report.entity' : 'report.client'),
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
