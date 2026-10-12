import { FormlyFieldConfig } from '@ngx-formly/core';
import { ReportUtilizationEditorComponent } from './report-utilization-editor.component';

export function reportActivityFilterConfig(
  THIS: ReportUtilizationEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroup: [
        // 🟦 الصف الأول (Branch + Department)
        {
          fieldGroupClassName: 'grid md:grid-cols-3 gap-6',
          fieldGroup: [
            {
              key: 'branchId',
              type: 'multi-select',
              props: {
                label: THIS._languageService.getTransValue(
                  'report.filterbybranch'
                ),
                optionsArr: [],
                loading: true,
              },
            },
            {
              key: 'departmentId',
              type: 'multi-select',
              props: {
                label: THIS._languageService.getTransValue(
                  'report.filterbydepartment'
                ),
                optionsArr: [],
                loading: true,
              },
            },
          ],
        },

        // 🟩 الصف الثاني (startDate + endDate + lawyerIds)
        {
          fieldGroupClassName: 'grid md:grid-cols-3 gap-6',
          fieldGroup: [
            {
              key: 'startDate',
              type: 'date',
              defaultValue: new Date(),
              props: {
                label: THIS._languageService.getTransValue('report.dateFrom'),
              },
            },
            {
              key: 'endDate',
              type: 'date',
              defaultValue: new Date(),
              props: {
                label: THIS._languageService.getTransValue('report.dateTo'),
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
          ],
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
  ];
}
