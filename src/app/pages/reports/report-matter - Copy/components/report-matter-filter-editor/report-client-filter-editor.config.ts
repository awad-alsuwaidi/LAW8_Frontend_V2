import { FormlyFieldConfig } from '@ngx-formly/core';
import { ReportClientFilterEditorComponent } from './report-client-filter-editor.component';
import { DropdownChangeEvent } from 'primeng/dropdown';

export function reportMatterFilterEditorConfig(
  THIS: ReportClientFilterEditorComponent
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
          key: 'clientGroupIds',
          props: {
            label: THIS._languageService.getTransValue(THIS.isInhouse ? 'common.entityGroup' : 'common.clientGroup'),
            optionsArr: [],
            placeholder: THIS._languageService.getTransValue(THIS.isInhouse ? 'common.entityGroup' : 'common.clientGroup'),
            loading: true,
          },
        },
        {
          type: 'multi-select',
          key: 'lawyerIds',
          props: {
            label: THIS._languageService.getTransValue('report.lawyer'),
            optionsArr: [],
                placeholder: THIS._languageService.getTransValue('Lawyers'),
            loading: true,
          },
        },
     {
  type: 'multi-select',
  key: 'countryIds',
  props: {
    label: THIS._languageService.getTransValue('clients.country'),
    optionsArr: [],
    loading: true,
    placeholder: THIS._languageService.getTransValue('clients.selectCountry')
  },
}

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
