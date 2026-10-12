import { FormlyFieldConfig } from '@ngx-formly/core';
import { ARReportEditorComponent } from './aRReport-editor.componen';

export function reportMatterFilterEditorConfig(
  THIS: ARReportEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid md:grid-cols-3 gap-6',
      fieldGroup: [
  
        {
          type: 'multi-select',
          key: 'clientIds',
          props: {
            virtualScroll: true,
            label: THIS._languageService.getTransValue(THIS.isInhouse ? 'report.entity' : 'report.client'),
            optionsArr: [],
            placeholder: THIS._languageService.getTransValue(THIS.isInhouse ? 'report.entities' : 'Clients'),
            loading: true,
          },
        },
           {
          type: 'multi-select',
          key: 'clientGroupIds',
          props: {
            label: THIS._languageService.getTransValue(THIS.isInhouse ? 'common.entityGroup' : 'common.clientGroup'),
            optionsArr: [],
                placeholder: THIS._languageService.getTransValue(THIS.isInhouse ? 'common.entityGroups' : 'common.clientGroup'),
            loading: true,
          },
        },
        {
          type: 'multi-select',
          key: 'lawyerIds',
          props: {
            label: THIS._languageService.getTransValue('matters.responsibleLaywer'),
            optionsArr: [],
            placeholder: THIS._languageService.getTransValue('Lawyers'),
            loading: true,
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
            placeholder: THIS._languageService.getTransValue('Matters'),
            multiple: true,
            emptyMessage: '',
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
