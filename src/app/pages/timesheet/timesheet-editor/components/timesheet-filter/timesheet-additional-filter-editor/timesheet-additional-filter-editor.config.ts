import { FormlyFieldConfig } from '@ngx-formly/core';
import { TimesheetAdditionalFilterEditorComponent } from './timesheet-additional-filter-editor.component';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';


export function timsheeteAdditionalFilterFields(
  THIS: TimesheetAdditionalFilterEditorComponent,
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
        // {
        //   type: 'multi-select',
        //   key: 'lawyerId',
        //   props: {
        //     label: THIS._languageService.getTransValue('report.lawyer'),
        //     multiple: true,
        //     optionsArr: getOptionsArray(
        //       THIS.lookupsData.lawyers.result,
        //       'id',
        //       'name',
        //       'id',
        //     ),
        //   },
        // },
        {
          type: 'multi-select',
          key: 'lawyerId',
          props: {
            label: THIS._languageService.getTransValue('report.lawyer'),
            multiple: true,
            optionsArr: THIS.lookupsData.lawyers.result.map((lawyer: any) => ({
              label: lawyer.name,
              value: {
                id: lawyer.id,
                name: lawyer.name,
                label: lawyer.name, 
              },
            })),
          },
        },
        {
          type: 'select',
          key: 'taskId',
          props: {
            label: THIS._languageService.getTransValue('matters.task'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.tasks.result,
              'id',
              'name',
              'object',
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
              'object',
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
