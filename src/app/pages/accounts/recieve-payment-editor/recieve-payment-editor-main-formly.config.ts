import { FormlyFieldConfig } from '@ngx-formly/core';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { RecievePaymentEditorComponent } from './recieve-payment-editor.component';
import { recievePaymentReferenceEditorFields } from './recieve-payment-editor-reference-formly.config';
import { recievePaymentSummaryEditorFields } from './recieve-payment-summary-formly.config';

export function recievePaymentMainEditorFields(
  THIS: RecievePaymentEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName:
        'grid gap-4 md:grid-cols-3 bg-white rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          className: 'col-span-3',
          template: `<h5 class="mb-4 text-grey500 text-lg font-bold"> ${THIS._languageService.getTransValue(
            'matters.mainInfo'
          )}</h5>`,
        },
        {
          key: 'accId',
          type: 'select',
          props: {
            label: 'Bank Account',
            optionsArr: THIS.lookupsData?.accounts?.result
              ? getOptionsArray(THIS.lookupsData.accounts.result, 'id', 'name')
              : [{ id: '', name: 'Loading...' }],
            required: true,
          },
        },
        {
          key: 'receipt',
          type: 'input',
          defaultValue: THIS.lookupsData?.receipt?.result?.code || '',
          props: {
            label: 'Receipt',
            disabled: true,
          },
        },
        {
          key: 'amount',
          defaultValue: 0,
          type: 'number',
          props: {
            label: 'Amount',
            required: true,
            onInput: () => {
            },
          },
        },
        {
          key: 'fromName',
          type: 'input',
          props: {
            label: 'From',
            required: true,
          },
        },
        {
          key: 'date',
          type: 'date',
          defaultValue: new Date(),
          props: {
            label: 'Date',
            required: true,
          },
        },

 {
  key: 'clientCheckNo',
  type: 'input',
  props: {
    label: THIS._languageService.getTransValue(
      THIS.isInhouse ? 'common.entityCheck' : 'common.clientCheck'
    ),
    required: true,
  },
},
        {
          key: 'paymentMethodId',
          type: 'select',
          props: {
            label: 'Payment Method',
            optionsArr: THIS.lookupsData?.payments?.result
              ? getOptionsArray(THIS.lookupsData.payments.result, 'id', 'name')
              : [{ id: '', name: 'Loading...' }],
            required: true,
          },
        },

        {
          key: 'originalBank',
          type: 'input',
          props: {
            label: 'original Bank',
            required: true,
          },
        },
      ],
    },
  ];
}
