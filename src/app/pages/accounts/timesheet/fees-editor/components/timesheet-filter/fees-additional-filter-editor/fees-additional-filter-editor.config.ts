import { FormlyFieldConfig } from '@ngx-formly/core';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FeesAdditionalFilterEditorComponent } from './fees-additional-filter-editor.component';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';

export function feesAdditionalFilterFields(
  THIS: FeesAdditionalFilterEditorComponent
): FormlyFieldConfig[] {
  const today = new Date().toISOString().split('T')[0];

  return [
    {
      fieldGroupClassName: 'grid md:grid-cols-2 gap-4',
      fieldGroup: [
        {
          type: 'date',
          key: 'fromDate',
          defaultValue: today,
          props: {
            label: THIS._languageService.getTransValue('matters.dateFrom'),
          },
        },
        {
          type: 'date',
          key: 'toDate',
          defaultValue: today,
          props: {
            label: THIS._languageService.getTransValue('matters.dateTo'),
          },
        },
        {
          type: 'select',
          key: 'lawyerId',

          props: {
            label: THIS._languageService.getTransValue('report.lawyer'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.lawyers.result,
              'id',
              'name',
              'object'
            ),
          },
        },
        {
          key: 'matterId',
          type: 'select',
          props: {
            virtualScroll: true,
            label: THIS._languageService.getTransValue('matters.title'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.matterCode.result,
              'id',
              'name',
              'object'
            ),
          },
        },
      ],
      validators: {
        validation: [
          {
            name: 'dateRange',
            options: {
              startDate: 'fromDate',
              endDate: 'toDate',
              errorPath: 'toDate',
            },
          },
        ],
      },
    },
  ];
}
