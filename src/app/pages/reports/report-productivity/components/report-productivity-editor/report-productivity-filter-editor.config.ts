import { FormlyFieldConfig } from '@ngx-formly/core';
import { ReportProductivityEditorComponent } from './report-productivity-editor.component';

export function reportProductivityFilterEditorConfig(
  THIS: ReportProductivityEditorComponent,
): FormlyFieldConfig[] {
  const currentLang =
    THIS._languageService.getSelectedLanguage() === 'en' ? 'en' : 'ar';

  return [
    {
      fieldGroupClassName: 'grid md:grid-cols-2 gap-6',

      fieldGroup: [
        {
          key: 'branchIds',
          type: 'multi-select',
          defaultValue: [],
          props: {
            label: THIS._languageService.getTransValue('report.filterbybranch'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          key: 'departmentIds',
          type: 'multi-select',
          defaultValue: [],
          props: {
            label: THIS._languageService.getTransValue(
              'report.filterbydepartment',
            ),
            optionsArr: [],
            loading: true,
          },
        },
      ],
    },
    {
      fieldGroupClassName: 'grid md:grid-cols-3 gap-6 mt-6',
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
          key: 'lawyerIds',
          type: 'multi-select',
          defaultValue: [],
          props: {
            label: THIS._languageService.getTransValue('report.lawyer'),
            optionsArr: [],
            loading: true,
          },
        },
        // {
        //   key: 'lang',
        //   type: 'select',
        //   props: {
        //     label: THIS._languageService.getTransValue('report.printLanguage'),
        //     optionsArr: [
        //       { label: THIS._languageService.getTransValue('report.english'), value: 'en' },
        //       { label: THIS._languageService.getTransValue('report.arabic'),  value: 'ar' },
        //     ],
        //   },
        //   defaultValue: currentLang,
        // },
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
          key: 'format',
          type: 'radio',
          defaultValue: 'pdf',
          props: {
            label: THIS._languageService.getTransValue('report.printType'),
            required: true,
            options: [
              {
                label: THIS._languageService.getTransValue('report.pdf'),
                value: 'pdf',
              },
              {
                label: THIS._languageService.getTransValue('report.excel'),
                value: 'xlsx',
              },
            ],
          },
        },
      ],
    },
  ];
}
