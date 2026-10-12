import { FormlyFieldConfig } from '@ngx-formly/core';
import { BillsExpensesEditorComponent } from './bills-expenses-editor.component';

export function getBillExpensesFormlyField(
  THIS: BillsExpensesEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-3',
      fieldGroup: [
        {
          type: 'date',
          key: 'FromDate',
          defaultValue: new Date(),
          className: 'col-md-3',
          props: {
            label: 'Start Date',
          },
        },
        {
          type: 'date',
          key: 'ToDate',
          defaultValue: new Date(),
          className: 'col-md-3',
          props: {
            label: 'End Date',
          },
        },

        {
          type: 'select',
          key: 'NeverBillExpenses',
          className: 'col-md-3',
          props: {
            label: 'Never Bill Entries',
            optionsArr: ['Exclude', 'include', 'Write Off'].map(
              (acc, index) => ({ label: acc, value: +index + 1 })
            ),
          },
          defaultValue: 1,
        },
        {
          type: 'checkbox',
          key: 'IncludeHoldExpenses',
          className: 'col-md-3 d-flex align-items-center',
          props: {
            label: 'Include Hold Charges',
          },
        },
        {
          key: 'expensesData',
        },
        {
          key: 'totalExpenses',
        },
        {
          type: 'button',
          className: 'col-span-2 flex justify-end ',
          props: {
            label: 'Load',
            class:
              'text-primary border border-primary !px-8 !py-3 !w-[auto] h-10 !leading-3	!text-sm',
            onClick: () => THIS.loadEverything(),
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
