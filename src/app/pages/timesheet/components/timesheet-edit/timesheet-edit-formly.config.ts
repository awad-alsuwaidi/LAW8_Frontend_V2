import { FormlyFieldConfig } from '@ngx-formly/core';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { TaskEnum, TimesheetEditComponent } from './timesheet-edit.component';

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
            virtualScroll: true,
            label: THIS._languageService.getTransValue('matters.title'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.matterId.result,
              'id',
              'name',
              'object',
            ),
            required: true,
          },
        },
        {
          type: 'date',
          key: 'tmDateDate',
          className: 'col-span-1',
          defaultValue: new Date(),
          props: {
            label: 'Date',
            showTime: false,
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
            optionsArr: getOptionsArray(
              THIS.lookupsData?.tasks.result,
              'id',
              'name',
            ),
            onChange: () => {
              THIS.calculateAmount();
            },
          },
        },
        {
          type: 'select',
          key: 'law_LawerId',
          className: 'col-span-1',
          defaultValue: THIS._authService.getDecodedToken()['Id'],
          props: {
            label: 'Lawyer',
            optionsArr: getOptionsArray(
              THIS.lookupsData?.lawyers.result,
              'id',
              'name',
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
          props: {
            label: 'Hours',
            type: 'number',
            step: 0.1,
            min: 0,
            attributes: {
              style: 'position: relative;',
            },
          },
          hooks: {
            onInit: (field) => {
              const control = field.formControl;
              control?.valueChanges.subscribe((val: number) => {
                const rate = Number(field?.form?.get('rate')?.value) || 0;
                const taskCodeId = Number(
                  field?.form?.get('law_TaskCodeId')?.value,
                );

                let effectiveRate = 0;
                if (taskCodeId === TaskEnum.Billable) {
                  effectiveRate = rate;
                }

                const amount = +(Number(val || 0) * effectiveRate).toFixed(2);
                field.form
                  ?.get('amount')
                  ?.setValue(amount, { emitEvent: false });
              });
              setTimeout(() => {
                const el = document.getElementById(field.id!);
                const icon = el?.parentElement?.querySelector(
                  '.icon-close',
                ) as HTMLElement;
                if (icon) {
                  icon.style.width = '0';
                  icon.style.visibility = 'hidden';
                }
              });
            },
          },
        },

        // {
        //   type: 'input',
        //   key: 'rate',
        //   className: 'col-span-1',
        //    hideExpression: () =>
        //     !THIS._authService.hasPermission('View_Rate&Amount'),
        //   props: {
        //     label: 'Rate',
        //     type: 'number',
        //   },
        //   hooks: {
        //     onInit: (field) => {
        //       setTimeout(() => {
        //         const el = document.getElementById(field.id!);
        //         const icon = el?.parentElement?.querySelector(
        //           '.icon-close'
        //         ) as HTMLElement;
        //         if (icon) {
        //           icon.style.width = '0';
        //           icon.style.visibility = 'hidden';
        //         }
        //       });
        //     },
        //   },
        // },
        {
          type: 'input',
          key: 'rate',
          className: 'col-span-1',
          hideExpression: () =>
            !THIS._authService.hasPermission('View_Rate&Amount'),
          props: {
            label: 'Rate',
            type: 'number',
          },
          hooks: {
            onInit: (field) => {
              const rateControl = field.formControl;
              rateControl?.valueChanges.subscribe((rate: number) => {
                const hours = Number(field?.form?.get('hours')?.value) || 0;
                const taskCodeId = Number(
                  field?.form?.get('law_TaskCodeId')?.value,
                );

                let effectiveRate = 0;
                if (taskCodeId === TaskEnum.Billable) {
                  effectiveRate = Number(rate) || 0;
                }

                const amount = +(hours * effectiveRate).toFixed(2);
                field.form
                  ?.get('amount')
                  ?.setValue(amount, { emitEvent: false });
              });

              setTimeout(() => {
                const el = document.getElementById(field.id!);
                const icon = el?.parentElement?.querySelector(
                  '.icon-close',
                ) as HTMLElement;
                if (icon) {
                  icon.style.width = '0';
                  icon.style.visibility = 'hidden';
                }
              });
            },
          },
        },

        {
          type: 'input',
          key: 'amount',
          className: 'col-span-1',
          hideExpression: () =>
            !THIS._authService.hasPermission('View_Rate&Amount'),
          props: {
            label: 'Amount',
            type: 'number',
            disabled: true,
          },
          hooks: {
            onInit: (field) => {
              setTimeout(() => {
                THIS.calculateAmount();

                const el = document.getElementById(field.id!);
                const icon = el?.parentElement?.querySelector(
                  '.icon-close',
                ) as HTMLElement;

                if (icon) {
                  icon.style.width = '0';
                  icon.style.visibility = 'hidden';
                }
              });
            },
          },
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
          props: {
            label: 'Explanation',
            required: true,
            rows: 2,
          },
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
          props: {
            label: 'Notes',
            rows: 2,
          },
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
            optionsArr: getOptionsArray(
              THIS.lookupsData?.holds?.result,
              'id',
              'name',
            ),
            onChange: (e: any) => {
              const holdControl = THIS.formly?.get('hold');
              if (holdControl) {
                holdControl.setValue(e?.originalEvent.target.innerText);
              }
            },
          },
        },
      ],
    },
  ];
}