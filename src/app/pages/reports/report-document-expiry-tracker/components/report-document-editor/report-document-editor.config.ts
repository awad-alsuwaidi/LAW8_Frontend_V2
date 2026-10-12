import { FormlyFieldConfig } from '@ngx-formly/core';
import { ReportDocumentEditorComponent } from './report-document-editor.component';

export function reportMatterFilterEditorConfig(
  THIS: ReportDocumentEditorComponent
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
            label: THIS._languageService.getTransValue('report.openDateFrom'),
          },
        },
        {
          key: 'dateTo',
          type: 'date',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('report.openDateTo'),
          },
        },
        {
          type: 'multi-select',
          key: 'clientIds',
          props: {
            virtualScroll: true,
            label: THIS._languageService.getTransValue(THIS.isInhouse ? 'report.entity' : 'report.client'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'multi-select',
          key: 'practiceArea',
          props: {
            label: THIS._languageService.getTransValue('common.practiceArea'),
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
          key: 'matterCategoryIds',
          props: {
            label: THIS._languageService.getTransValue('common.matterCategory'),
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
            virtualScroll: true,
          },
        },
        {
          type: 'select',
          key: 'juriductionsIds',
          props: {
            label: THIS._languageService.getTransValue('matters.jurisdicion'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'select',
          key: 'branchId',
          className: 'col-lg-3 col-md-4',
          props: {
            label: THIS._languageService.getTransValue('common.branch'),
            optionsArr: [],
            loading: true,
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
    // {
    //   fieldGroupClassName: 'grid grid-cols-1 py-2',
    //   fieldGroup: [
    //     {
    //       key: 'printTypeId',
    //       type: 'radio',
    //       defaultValue: 1,
    //       props: {
    //         label: THIS._languageService.getTransValue('report.printType'),
    //         required: true,
    //         options: [
    //           {
    //             label: THIS._languageService.getTransValue('report.excel'),
    //             value: 2,
    //           },
    //           {
    //             label: THIS._languageService.getTransValue('report.pdf'),
    //             value: 1,
    //           },
    //         ],
    //       },
    //     },
    //   ],
    // },
  ];
}
