import { FormlyFieldConfig } from '@ngx-formly/core';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { TrustToGeneralComponent } from './trust-to-general.component';

// const showOnTouchOrSubmit = 'formState.isSubmitted || formControl.touched';
const showOnTouchOrSubmit = (field: any) =>
  field?.options?.formState?.isSubmitted || field?.formControl?.touched;

export function trustToGeneralFields(THIS: TrustToGeneralComponent): FormlyFieldConfig[] {
  return [
   {
  fieldGroupClassName: 'grid gap-4 lg:grid-cols-12 items-start',
  fieldGroup: [
    // LEFT (8)
    {
      className: 'lg:col-span-8',
      fieldGroup: [
        // Header
        {
          fieldGroupClassName: 'bg-white rounded-2xl my-4',
          fieldGroup: [
            {
              // template: `
              //   <h2 class="text-colorsTextTextPrimary font-bold text-2xl mb-1">Trust → General Transfer</h2>
              //   <p class="text-grey400 text-xs m-0">Move client trust funds to general accounts against approved matter bills</p>
              // `,
            },
          ],
        },

        // Two Cards
        {
          fieldGroupClassName: 'grid gap-4 md:grid-cols-2 my-4',
          fieldGroup: [
            {
              fieldGroupClassName: 'bg-white rounded-2xl',
              fieldGroup: [
                // from
                {
                  key: 'fromTrustAccountId',
                  type: 'select',
                  props: {
                    label: 'From (Trust Bank Account)',
                    required: true,
                    showFilter:false,
                    optionsArr: THIS.trustAccountsOptions?.length
                      ? getOptionsArray(THIS.trustAccountsOptions, 'id', 'name')
                      : [],
                  },
                  expressionProperties: { 'validation.show': showOnTouchOrSubmit },
                  hooks: {
                    onInit: (field) => {
                      field?.formControl?.valueChanges
                        ?.pipe(THIS._unsubscribe.takeUntilDestroy())
                        .subscribe((id: any) => THIS.loadTrustAccountBalance(id).subscribe());
                    },
                  },
                },

                // balance
                {
                  key: 'availableTrustBalance',
                  type: 'input',
                  props: { label: 'Available Trust Balance', disabled: true },
                  expressions: {
                    'formControl.value': () =>
                      `AED ${THIS.money(THIS.formlyModel?.availableTrustBalance ?? 0)}`,
                  },
                },

                // to
                {
                  key: 'toGeneralAccountId',
                  type: 'select',
                  props: {
                    label: 'To (General Bank Account)',
                    required: true,
                    showFilter:false,
                    optionsArr: THIS.generalAccountsOptions?.length
                      ? getOptionsArray(THIS.generalAccountsOptions, 'id', 'name')
                      : [],
                  },
                  expressionProperties: { 'validation.show': showOnTouchOrSubmit },
                },
              ],
            },

            {
              fieldGroupClassName: 'bg-white rounded-2xl',
              fieldGroup: [
                {
                  key: 'transferDate',
                  type: 'date',
                  defaultValue: new Date(),
                  props: { label: 'Transfer Date', required: true },
                  expressionProperties: { 'validation.show': showOnTouchOrSubmit },
                },
                {
                  key: 'referenceNo',
                  type: 'input',
                  props: { label: 'Reference / Voucher No.', 
                    // placeholder: 'Auto-generated or enter manually'
                   },
                },
                {
                  key: 'memo',
                  type: 'input',
                  props: { label: 'Description / Memo',
                    //  placeholder: 'e.g., Settlement of bills for Matter M-2045'
                     },
                },
              ],
            },
          ],
        },

        // Matter Card
        {
          fieldGroupClassName: 'bg-white rounded-2xl my-4',
          fieldGroup: [
            { template: `<h5 class="text-grey500 text-lg font-bold mb-4">Matter & Billing Allocation</h5>` },

            {
              key: 'matterId',
              type: 'select',
              props: {
                label: 'Select Matter',
                required: true,
                virtualScroll: true,
                optionsArr: THIS.mattersOptions?.length
                  ? getOptionsArray(THIS.mattersOptions, 'id', 'name')
                  : [],
              },
              expressionProperties: { 'validation.show': showOnTouchOrSubmit },
              hooks: {
                onInit: (field) => {
                  field?.formControl?.valueChanges
                    ?.pipe(THIS._unsubscribe.takeUntilDestroy())
                    .subscribe((mid: any) => THIS.loadMatterData(mid).subscribe());
                },
              },
            },

            { type: 'formly-template', props: { template: THIS.matterInfoTpl } },
            { type: 'formly-template', props: { template: THIS.billsTpl } },
          ],
        },
      ],
    },

    // RIGHT (4)
    // {
    //   className: 'lg:col-span-4',
    //   fieldGroup: [
    //     {
    //       fieldGroupClassName: 'bg-white rounded-2xl my-4 lg:sticky lg:top-4',
    //       fieldGroup: [
    //         { template: `<h5 class="text-grey500 text-lg font-bold mb-4">Transfer Summary</h5>` },
    //         { type: 'formly-template', props: { template: THIS.summaryTpl } },
    //       ],
    //     },
    //   ],
    // },
  ],
}
  ];
}