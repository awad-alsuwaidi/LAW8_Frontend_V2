import { FormlyFieldConfig } from '@ngx-formly/core';
import { PreBillTimeFeesEditorComponent } from './pre-bill-time-fees-editor.component';

export function preBillTimeFeesFormlyField(
  THIS: PreBillTimeFeesEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-3',
      fieldGroup: [
        {
          type: 'date',
          key: 'timeSheetStartDate',
          className: '',
          defaultValue: new Date(),
          props: {
            label: 'Bill From',
            onSelect: (e: Date) => {
              const fromDateControl = THIS.formly.get('expenses.FromDate');
              if (fromDateControl) {
                fromDateControl.setValue(new Date(e));
              }
            },
          },
          // hooks: {
          //     onInit: () => {
          //         THIS.formly
          //             .get('FromDate')
          //             .valueChanges.pipe(THIS._sharedService.takeUntilDistroy())
          //             .subscribe({
          //                 next: (res: any) => {
          //                     THIS.formly
          //                         .get('expenses.FromDate')
          //                         .setValue(new Date(res));
          //                 },
          //             });
          //     },
          // },
        },
        {
          type: 'date',
          key: 'timeSheetEndDate',
          defaultValue: new Date(),
          className: '',
          props: {
            label: 'Bill To',
            onSelect: (e: Date) => {
              const fromDateControl = THIS.formly.get('expenses.ToDate');
              if (fromDateControl) {
                fromDateControl.setValue(new Date(e));
              }
            },
          },
        },
        {
          type: 'select',
          key: 'NeverBillFees',
          className: '',
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
          key: 'IncludeHoldFees',
          className: ' flex items-center self-center',
          props: {
            label: 'Include Held Entries',
          },
        },
        {
          key: 'feesData',
        },
        { key: 'totalFees' },
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
