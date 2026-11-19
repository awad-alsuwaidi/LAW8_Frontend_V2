import { FormlyFieldConfig } from '@ngx-formly/core';
import { ReportDocumentEditorComponent } from './report-document-editor.component';

export function reportDocumentEditorConfig(
  THIS: ReportDocumentEditorComponent,
): FormlyFieldConfig[] {
  const currentLang =
    THIS._languageService.getSelectedLanguage() === 'en' ? 'en' : 'ar';

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
          defaultValue: [],
          props: {
            virtualScroll: true,
            label: THIS._languageService.getTransValue(
              THIS.isInhouse ? 'report.entity' : 'report.client',
            ),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'multi-select',
          key: 'practiceAreaIds', 
          defaultValue: [],
          props: {
            label: THIS._languageService.getTransValue('common.practiceArea'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'multi-select',
          key: 'lawyerIds',
          defaultValue: [],
          props: {
            label: THIS._languageService.getTransValue('report.lawyer'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'multi-select',
          key: 'categoryIds', 
          defaultValue: [],
          props: {
            label: THIS._languageService.getTransValue('common.matterCategory'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'multi-select',
          key: 'matterTypeIds',
          defaultValue: [],
          props: {
            label: THIS._languageService.getTransValue('matters.matterType'),
            optionsArr: [],
            loading: true,
            virtualScroll: true,
          },
        },
        {
          type: 'multi-select', 
          key: 'jurisdictionIds', 
          defaultValue: [],
          props: {
            label: THIS._languageService.getTransValue('matters.jurisdicion'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          type: 'multi-select', 
          key: 'branchIds', 
          defaultValue: [],
          props: {
            label: THIS._languageService.getTransValue('common.branch'),
            optionsArr: [],
            loading: true,
          },
        },
        // {
        //   type: 'select',
        //   key: 'lang',
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
        // {
        //   key: 'format',
        //   type: 'radio',
        //   defaultValue: 'pdf',
        //   props: {
        //     label: THIS._languageService.getTransValue('report.printType'),
        //     required: true,
        //     options: [
        //       { label: THIS._languageService.getTransValue('report.pdf'),   value: 'pdf'  },
        //       { label: THIS._languageService.getTransValue('report.excel'), value: 'xlsx' },
        //     ],
        //   },
        // },
      ],
    },
  ];
}
