import { FormlyFieldConfig } from '@ngx-formly/core';
import { TmSessionFilterAdditionalEditorComponent } from './tm-session-filter-additional-editor.component';
import { getEnumKeys } from 'src/app/@core/utilities/functions/enum-keys';
import { DashboardDuration } from 'src/app/pages/dashboard/enums/dashboard-duration';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';

export function tmSessionAdditionalFilterFields(
  THIS: TmSessionFilterAdditionalEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid md:grid-cols-2 gap-4',
      fieldGroup: [
        {
          type: 'date',
          key: 'FromDate',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('matters.dateFrom'),
          },
        },
        {
          type: 'date',
          key: 'ToDate',
          defaultValue: new Date(), 
          props: {
            label: THIS._languageService.getTransValue('matters.dateTo'),
          },
        },

        {
          type: 'select',
          key: 'StatusId',
          props: {
            label: THIS._languageService.getTransValue('matters.status'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.status.result,
              'id',
              'name',
              'object'
            ),
          },
        },
        {
          type: 'select',
          key: 'AvailabilityId',
          props: {
            label: THIS._languageService.getTransValue('matters.availability'),
            optionsArr: getOptionsArray(
              getEnumKeys(DashboardDuration).map((value, index) => ({
                label: THIS._languageService.getTransValue(`common.${value}`),
                value: index + 1,
              })),
              'value',
              'label',
              'object'
            ),
          },
        },

        {
          type: 'select',
          key: 'TypeId',
          props: {
            label: THIS._languageService.getTransValue('matters.type'),
            optionsArr: THIS._router.url.includes('activity')
              ? getOptionsArray(
                  THIS.lookupsData.activityType.result,
                  'id',
                  'name',
                  'object'
                )
              : getOptionsArray(
                  ['All', 'Upcomming', 'Past'].map((value, index) => ({
                    label: value,
                    value: index + 1,
                  })),
                  'value',
                  'label',
                  'object'
                ),
          },
          hide: THIS._router.url.includes('tasks'),
        },
        {
          type: 'select',
          key: 'periorityId',
          props: {
            label: THIS._languageService.getTransValue('matters.priority'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.taskPriority.result,
              'id',
              'name',
              'object'
            ),
          },
          hide: !THIS._router.url.includes('tasks'),
        },
        {
          type: 'select',
          key: 'UserId',
          props: {
            label: THIS._languageService.getTransValue('matters.user'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.user.result,
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
              startDate: 'FromDate',
              endDate: 'ToDate',
              errorPath: 'ToDate',
            },
          },
        ],
      },
    },
  ];
}
