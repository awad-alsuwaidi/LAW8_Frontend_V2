import { FormlyFieldConfig } from '@ngx-formly/core';
import { ReportClientFilterEditorComponent } from './report-client-filter-editor.component';

export function reportClientFilterEditorConfig(
  THIS: ReportClientFilterEditorComponent,
): FormlyFieldConfig[] {
  const currentLang =
    THIS._languageService.getSelectedLanguage() === 'en' ? 'en' : 'ar';

  return [
    {
      fieldGroupClassName: 'grid md:grid-cols-3 gap-6',
      fieldGroup: [
        {
          key: 'createdFrom',
          type: 'date',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('report.openDateFrom'),
          },
        },
        {
          key: 'createdTo',
          type: 'date',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('report.openDateTo'),
          },
        },
        {
          type: 'multi-select',
          key: 'clientGroupIds',
          defaultValue: [],
          props: {
            label: THIS._languageService.getTransValue(
              THIS.isInhouse ? 'common.entityGroup' : 'common.clientGroup',
            ),
            placeholder: THIS._languageService.getTransValue(
              THIS.isInhouse ? 'common.entityGroup' : 'common.clientGroup',
            ),
            optionsArr: [],
            loading: true,
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
        {
          type: 'multi-select',
          key: 'countryIds',
          defaultValue: [],
          props: {
            label: THIS._languageService.getTransValue('clients.country'),
            placeholder: THIS._languageService.getTransValue(
              'clients.selectCountry',
            ),
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
              startDate: 'createdFrom',
              endDate: 'createdTo',
              errorPath: 'createdTo',
            },
          },
        ],
      },
    },
    // {
    //   fieldGroupClassName: 'grid grid-cols-1 py-2',
    //   fieldGroup: [
    //     {
    //       key: 'format',
    //       type: 'radio',
    //       defaultValue: 'pdf',
    //       props: {
    //         label: THIS._languageService.getTransValue('report.printType'),
    //         required: true,
    //         options: [
    //           { label: THIS._languageService.getTransValue('report.pdf'),   value: 'pdf'  },
    //           { label: THIS._languageService.getTransValue('report.excel'), value: 'xlsx' },
    //         ],
    //       },
    //     },
    //   ],
    // },
  ];
}
