import { FormlyFieldConfig } from '@ngx-formly/core';
import { ExpensesEditorComponent } from './expenses-editor.component';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';

export function expensesEditorFormlyFields(
  THIS: ExpensesEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName:
        'grid gap-4 md:grid-cols-2 bg-surfaceLevel2 rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          className: 'col-span-2',
          template: `<h5 class="mb-4 text-grey500 text-lg font-bold"> 
                        ${THIS._languageService.getTransValue('Main')}
                    </h5>`,
        },

        {
          fieldGroupClassName:
            'grid gap-4 md:grid-cols-2 p-6 bg-grey100 rounded-2xl',
          fieldGroup: [
            {
              key: 'matterId',
              type: 'select',
              className: 'col-span-2',
              props: {
                label: THIS._languageService.getTransValue('billing.matter'),
                required: true,
                virtualScroll: true,
                optionsArr: getOptionsArray(
                  THIS.lookupsData?.matters.result,
                  'id',
                  'name'
                ),
                onChange: (e: any) => {
                  const matterControl = THIS.formly?.get('matter');
                  if (matterControl) {
                    matterControl.setValue(e?.originalEvent.target.innerText);
                  }
                },
              },
            },
            {
              key: 'matter',
            },
            {
              key: 'check_Receipt',
              type: 'input',
              className: 'col-4',
              props: {
                label: THIS._languageService.getTransValue('billing.check'),
              },
            },
            {
              key: 'typeId',
              type: 'select',
              className: 'col-6',
              props: {
                label: THIS._languageService.getTransValue('billing.type'),
                optionsArr: getOptionsArray(
                  THIS.lookupsData?.types.result,
                  'id',
                  'name'
                ),
                onChange: (e: any) => {
                  const typeControl = THIS.formly?.get('type');
                  if (typeControl) {
                    typeControl.setValue(e?.originalEvent.target.innerText);
                  }
                },
              },
            },
            {
              key: 'type',
            },
          ],
        },
        {
          fieldGroupClassName:
            'grid gap-4 md:grid-cols-2 p-6 bg-grey100 rounded-2xl',
          fieldGroup: [
            {
              key: 'amount',
              type: 'input',
              className: 'col-span-2',
              props: {
                label: THIS._languageService.getTransValue('billing.amount'),
                pKeyFilter: 'int',
              },
            },
            {
              key: 'quantity',
              type: 'input',
              className: 'col-3',
              props: {
                label: THIS._languageService.getTransValue('billing.quantity'),
                pKeyFilter: 'int',
                keyup: () => {
                  THIS.calcAmount();
                },
              },
            },
            {
              key: 'price',
              type: 'input',
              className: 'col-3',
              props: {
                label: THIS._languageService.getTransValue('billing.price'),
                pKeyFilter: 'int',
                keyup: () => {
                  THIS.calcAmount();
                },
              },
            },
          ],
        },
      ],
    },
    {
      fieldGroupClassName:
        'grid gap-4 md:grid-cols-3 bg-white rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          className: 'col-span-3',
          template: `<h5 class="mb-4 text-grey500 text-lg font-bold"> 
                        ${THIS._languageService.getTransValue('Details')}
                    </h5>`,
        },
        {
          key: 'date',
          type: 'date',
          className: 'col-3',
          props: {
            label: THIS._languageService.getTransValue('billing.date'),
          },
          defaultValue: new Date().toISOString().split('T')[0],
        },
        {
          key: 'paidToReceivedFrom',
          type: 'input',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('billing.paidTo'),
          },
        },
        {
          key: 'lawyerId',
          type: 'select',

          defaultValue: THIS._authService.getDecodedToken()['Id'],
          props: {
            label: THIS._languageService.getTransValue('billing.lawyer'),
            optionsArr: getOptionsArray(
              THIS.lookupsData?.lawyers.result,
              'id',
              'name'
            ),
            onChange: (e: any) => {
              const lawyerNameControl = THIS.formly?.get('lawyerName');
              if (lawyerNameControl) {
                lawyerNameControl.setValue(e?.originalEvent.target.innerText);
              }
            },
          },
        },
        {
          key: 'lawyerName',
        },
        {
          key: 'explanation',
          type: 'textarea',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('billing.explanation'),
            rows: 1,
          },
        },
        {
          key: 'holdId',
          type: 'select',
          className: 'col-4',
          props: {
            label: THIS._languageService.getTransValue('billing.hold'),
            optionsArr: getOptionsArray(
              THIS.lookupsData?.holds.result,
              'id',
              'name'
            ),
            onChange: (e: any) => {
              const holdControl = THIS.formly?.get('hold');
              if (holdControl) {
                holdControl.setValue(e?.originalEvent.target.innerText);
              }
            },
          },
        },
        {
          key: 'hold',
        },
      ],
    },
  ];
}
