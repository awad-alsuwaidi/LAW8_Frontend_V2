import { FormlyFieldConfig } from '@ngx-formly/core';
import { TimesheetEditComponent } from './timesheet-edit.component';

export function timesheetEditorFormlyConfig(
  THIS: TimesheetEditComponent,
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid grid-cols-2 gap-6 mb-2',
      fieldGroup: [
        {
          key: 'matterId',
          type: 'select',
          className: 'col-span-1',
          props: {
            label: THIS._languageService.getTransValue('matters.title'),
            optionsArr: (THIS.lookupsData?.matterId?.result || []).map(
              (m: any) => ({
                label: m.code || m.descr,
                value: m.id,
              }),
            ),
            required: true,
          },
        },
        {
          type: 'date',
          key: 'tmDateDate',
          className: 'col-span-1',
          props: {
            label: 'Date',
            showTime: false,
            required: true,
          },
        },
      ],
    },
    {
      fieldGroupClassName: 'grid grid-cols-2 gap-6 mb-2',
      fieldGroup: [
        {
          type: 'select',
          key: 'law_TaskCodeId',
          className: 'col-span-1',
          props: {
            label: 'Type',
            optionsArr: (THIS.lookupsData?.tasks?.result || []).map(
              (t: any) => ({
                label: t.nameEn,
                value: t.id,
              }),
            ),
            onChange: () => THIS.calculateAmount(),
          },
        },
        {
          type: 'select',
          key: 'law_LawerId',
          className: 'col-span-1',
          props: {
            label: 'Lawyer',
            optionsArr: (THIS.lookupsData?.lawyers?.result || []).map(
              (u: any) => ({
                label: u.name,
                value: u.userId,
              }),
            ),
          },
        },
      ],
    },
    {
      fieldGroupClassName: 'grid grid-cols-3 gap-6 mb-2',
      fieldGroup: [
        {
          type: 'input',
          key: 'hours',
          className: 'col-span-1',
          props: { label: 'Hours', type: 'number', step: 0.1, min: 0 },
          hooks: {
            onInit: (field) => {
              field.formControl?.valueChanges.subscribe(() =>
                THIS.calculateAmount(),
              );
            },
          },
        },
        {
          type: 'input',
          key: 'rate',
          className: 'col-span-1',
          // hideExpression: () =>
          //   !THIS._authService.hasPermission('View_Rate&Amount'),
          props: { label: 'Rate', type: 'number' },
          hooks: {
            onInit: (field) => {
              field.formControl?.valueChanges.subscribe(() =>
                THIS.calculateAmount(),
              );
            },
          },
        },
        {
          type: 'input',
          key: 'amount',
          className: 'col-span-1',
          // hideExpression: () =>
          //   !THIS._authService.hasPermission('View_Rate&Amount'),
          props: { label: 'Amount', type: 'number', disabled: true },
        },
      ],
    },
    {
      fieldGroupClassName: 'mb-2',
      fieldGroup: [
        {
          type: 'textarea',
          key: 'explanationExplanation',
          className: 'col-span-3',
          props: { label: 'Explanation', required: true, rows: 2 },
        },
      ],
    },
    {
      fieldGroupClassName: 'mb-2',
      fieldGroup: [
        {
          type: 'textarea',
          key: 'notes',
          className: 'col-span-3',
          props: { label: 'Notes', rows: 2 },
        },
      ],
    },
    {
      fieldGroupClassName: 'grid grid-cols-3 gap-6 mb-2',
      fieldGroup: [
        {
          key: 'holdId',
          type: 'select',
          className: 'col-span-1',
          defaultValue: 1,
          props: {
            showFilter: false,
            label: THIS._languageService.getTransValue('billing.hold'),
            optionsArr: (THIS.lookupsData?.holds?.result || []).map(
              (h: any) => ({
                label: h.nameEn,
                value: h.id,
              }),
            ),
          },
        },
      ],
    },
  ];
}
