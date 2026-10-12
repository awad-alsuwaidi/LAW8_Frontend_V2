import { FormlyFieldConfig } from '@ngx-formly/core';
import { MatterBillingEditorComponent } from './matter-billing-editor.component';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { DropdownChangeEvent } from 'primeng/dropdown';

export function matterBillingEditorFieldsConfig(
  THIS: MatterBillingEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName:
        'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 bg-white rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          className: 'col-span-1 sm:col-span-2 md:col-span-3',
          template: `<h5 class="mb-4 text-grey500 text-lg font-bold"> 
            ${THIS._languageService.getTransValue('matters.billingSettings')}
          </h5>`,
        },
        {
          type: 'select',
          key: 'feesFrequencyId',
          className: 'col-span-1',
          props: {
            label: THIS._languageService.getTransValue('matters.frequency'),
            optionsArr: [],
            loading: false,
            showFilter: false,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          type: 'select',
          key: 'billingTemplatId',
          className: 'col-span-1',
          props: {
            label: THIS._languageService.getTransValue(
              'matters.billingTemplate'
            ),
            optionsArr: [],
            loading: false,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          type: 'select',
          key: 'emailTemplatId',
          className: 'col-span-1',
          props: {
            label: THIS._languageService.getTransValue('matters.emailTemplate'),
            optionsArr: [],
            loading: false,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
                {
          type: 'radio',
          key: 'isBasedBilling',
          props: {
            label: THIS._languageService.getTransValue(
              'Use Task Based Billing'
            ),
            options: [
              {
                label: THIS._languageService.getTransValue('Yes'),
                value: true,
              },
              {
                label: THIS._languageService.getTransValue('No'),
                value: false,
              },
            ],
            onChange: (e: DropdownChangeEvent) => {},
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },

        // {
        //   type: 'select',
        //   key: 'feesTaskGroupId',
        //   props: {
        //     label: THIS._languageService.getTransValue('TaskGroup'),
        //     optionsArr: getOptionsArray(
        //       THIS.lookupsData?.taskGroup?.result || [],

        //       'id',
        //       'name'
        //     ),
        //   },
        //   expressions: {
        //     'props.readonly': 'formState.readonly',
        //   },
        // },
//         {
//   type: 'select',
//   key: 'feesTaskGroupId',
//   props: {
//     label: THIS._languageService.getTransValue('matters.billingTaskGroup'),
//     optionsArr: [], 
//   },
//   expressions: {
//     'props.disabled': (field) => field.model?.isBasedBilling !== true,
//     'props.readonly': 'formState.readonly',
//   },
// },
{
  type: 'select',
  key: 'feesTaskGroupId',
  props: {
    label: THIS._languageService.getTransValue('matters.billingTaskGroup'),
  },
  expressionProperties: {
    'props.optionsArr': () => {
      const list = THIS.lookupsData?.taskGroup?.result?.dataList || [];
return getOptionsArray(list, 'id', 'nameEn');    },
    // 'props.disabled': (field) => field.model?.isBasedBilling !== false,
  },
  expressions: {
    'props.readonly': 'formState.readonly',
  },
},
        {
          type: 'select',
          key: 'defaultTaskTypeId',
          defaultValue: 1,
          className: 'col-span-1',
          props: {
            label: THIS._languageService.getTransValue('matters.defaultTask'),
            optionsArr: [],
            loading: false,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          type: 'radio',
          key: 'billingTypeId',
          defaultValue: 1,
          className: 'col-span-1',
          props: {
            label: THIS._languageService.getTransValue('matters.billingType'),
            options: [
              {
                label: THIS._languageService.getTransValue('billing.amount'),
                value: 2,
              },
              {
                label: THIS._languageService.getTransValue(
                  'billing.defaultRate'
                ),
                value: 1,
              },
            ],
            optionsArr: [],
            loading: true,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          type: 'input',
          key: 'rateAmount',
          className: 'col-span-1',
          props: {
            label: THIS._languageService.getTransValue('Amount'),
            type: 'number',
            optionsArr: [],
            loading: true,
          },
          expressions: {
            'props.readonly': 'formState.readonly',
            hide: (field: FormlyFieldConfig) =>
              field.model?.billingTypeId != 2 || !field.model?.billingTypeId,
          },
        },
        {
          type: 'select',
          key: 'defaultRateId',
          defaultValue: 1,
          className: 'col-span-1',
          props: {
            label: THIS._languageService.getTransValue('matters.defaultRate'),
            optionsArr: [],
            loading: true,
          },
          expressions: {
            'props.readonly': 'formState.readonly',
            hide: (field: FormlyFieldConfig) =>
              field.model?.billingTypeId != 1 || !field.model?.billingTypeId,
          },
        },
        {
          type: 'input',
          key: 'billingClaimAmount',
          className: 'col-span-1',
          defaultValue: 0,
          props: {
            label: THIS._languageService.getTransValue('matters.claimAmount'),
            type: 'number',
            optionsArr: [],
            loading: false,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
      ],
    },

    {
      fieldGroupClassName:
        'grid gap-4 md:grid-cols-2 bg-white rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          className: 'col-span-2',
          template: `<h5 class="mb-4 text-grey500 text-lg font-bold"> ${THIS._languageService.getTransValue(
            'matters.fees'
          )}</h5>`,
        },
       

        {
          type: 'radio',
          key: 'isDiscountFees',
          props: {
            label: THIS._languageService.getTransValue(
              'Apply Discount To Fees'
            ),
            options: [
              {
                label: THIS._languageService.getTransValue('Yes'),
                value: true,
              },
              {
                label: THIS._languageService.getTransValue('No'),
                value: false,
              },
            ],
            onChange: (e: DropdownChangeEvent) => {},
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        // {
        //   type: 'radio',
        //   key: 'discountTypeId',
        //   props: {
        //     label: THIS._languageService.getTransValue('Discount Type'),
        //     options: [
        //       {
        //         label: THIS._languageService.getTransValue('Percentage'),
        //         value: 1,
        //       },
        //       {
        //         label: THIS._languageService.getTransValue('Amount'),
        //         value: 2,
        //       },
        //     ],
        //     optionLabel: '',
        //     onChange: (e: DropdownChangeEvent) => {},
        //   },
        //   expressions: {
        //     'props.readonly': 'formState.readonly',
        //   },
        // },
        // {
        //   type: 'input',
        //   key: 'discountValue',
        //   props: {
        //     label: THIS._languageService.getTransValue('Discount Percentage'),
        //   },
        //   expressions: {
        //     'props.readonly': 'formState.readonly',
        //   },
        // },
        {
  type: 'input',
  key: 'discountValue',
  props: {
    label: THIS._languageService.getTransValue('Discount Percentage'),
    type: 'number',
  },
  expressions: {
    'props.disabled': (field) => field.model?.isDiscountFees !== true,
    'props.readonly': 'formState.readonly',
  },
},
{
  type: 'select',
  key: 'feesQuoteTypeId',
  hooks: {
    onInit: (field) => {
      field.formControl?.valueChanges.subscribe(() => {
        if (field.options?.formState?.readonly) return;

        field.form?.get('billOption')?.setValue(null);
        field.form?.get('numbersOfBill')?.setValue(null);
      });
    },
  },
  props: {
    label: THIS._languageService.getTransValue('matters.quoteType'),
    optionsArr: getOptionsArray(
      THIS.lookupsData?.quote?.result || [],
      'id',
      'name'
    ),
  },
  expressions: {
    'props.readonly': 'formState.readonly',
  },
},
        // {
        //   type: 'input',
        //   key: 'hours',
        //   props: {
        //     label: THIS._languageService.getTransValue('Hours'),
        //   },
        //   expressions: {
        //     'props.readonly': 'formState.readonly',
        //   },
        // },
        {
          type: 'input',
          key: 'amount',
          props: {
            label: THIS._languageService.getTransValue('Amount'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        // {
        //   type: 'input',
        //   key: 'everyBill',
        //   props: {
        //     label: THIS._languageService.getTransValue('Every Bill'),
        //   },
        //   expressions: {
        //     'props.readonly': 'formState.readonly',
        //   },
        // },
        // {
        //   type: 'radio',
        //   key: 'billOption',
        //   props: {
        //     label: '.',
        //     options: [
        //       { label: 'No of Bills', value: 'noOfBillRadio' },
        //       { label: 'Every Bill', value: 'everyBillRadio' },
        //     ],
        //     labelClass: 'empty-label',
        //   },
        // },
{
  type: 'radio',
  key: 'billOption',
  props: {
    label: THIS._languageService.getTransValue('Bill Frequency'),
    options: [
      { label: 'No of Bills', value: 'noOfBillRadio' },
      { label: 'Every Bill', value: 'everyBillRadio' },
    ],
    labelClass: 'empty-label',
  },
  expressions: {
    'props.disabled': (field: any) => {
      const isReadonly = field.options?.formState?.readonly === true;
      const isQuoteTypeInvalid = ![1, 2, 3, 4].includes(field.model?.feesQuoteTypeId);
      return isReadonly || isQuoteTypeInvalid;
    }
    
  }
},
        // {
        //   type: 'input',
        //   key: 'numbersOfBill',
        //   props: {
        //     label: THIS._languageService.getTransValue('Numbers of Bills'),
        //   },
        //   expressions: {
        //     'props.readonly': 'formState.readonly',
        //   },
        // },
{
  type: 'input',
  key: 'numbersOfBill',
  props: {
    label: THIS._languageService.getTransValue('Numbers of Bills'),
  },
  expressions: {
    'props.disabled': (field) =>
      field.model?.billOption !== 'noOfBillRadio',
    'props.readonly': 'formState.readonly',
  },
},

        {
          type: 'input',
          key: 'maxFees',
          props: {
            label: THIS._languageService.getTransValue('Maximum Fee'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          type: 'input',
          key: 'billedAmount',
          props: {
            label: THIS._languageService.getTransValue('Billed Amount'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
      ],
      expressions: {
        hide: () => THIS._router.url.includes('add'),
      },
    },
    {
      fieldGroupClassName:
        'grid gap-4 md:grid-cols-3 bg-white rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          type: 'switch',
          key: 'isCreateDisbursement',
          defaultValue: true,
          className: 'col-span-3',
          props: {
            label: THIS._languageService.getTransValue(
              'Automatically Create Disbursements'
            ),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },

        {
          type: 'select',
          key: 'disbursementId',
          props: {
            showFilter:false,
            label: THIS._languageService.getTransValue(
              'Automatically Create Disbursements'
            ),
            optionsArr: getOptionsArray(
              THIS.lookupsData?.disbursement?.result || [],

              'id',
              'name'
            ),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          type: 'select',
          key: 'typeId',
          props: {
            label: THIS._languageService.getTransValue('Type'),
            optionsArr: getOptionsArray(
              THIS.lookupsData?.type?.result || [],

              'id',
              'name'
            ),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },

      
         {
          type: 'input',
          key: 'amountDisbursements',
          props: {
            label: THIS._languageService.getTransValue('Amount'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
    },
      {
          type: 'input',
          key: 'explanationId',
         className: 'col-span-3',
          props: {
            label: THIS._languageService.getTransValue('Explanation'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
      ],
      expressions: {
        hide: () => THIS._router.url.includes('add'),
      },
    },
    {
      fieldGroupClassName:
        'grid gap-4 md:grid-cols-3 bg-white rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          type: 'switch',
          key: 'isTaxes',
          defaultValue: true,
          className: 'col-span-3',
          props: {
            label: THIS._languageService.getTransValue('Taxes'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },

        {
          type: 'input',
          key: 'salesTaxOnDisbursement',
          props: {
            label: THIS._languageService.getTransValue(
              'Sales Tax on Disbursements'
            ),
            type: 'number',
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          type: 'input',
          key: 'salesTaxOnFees',
          props: {
            label: THIS._languageService.getTransValue('Sales Tax on Fees'),
            type: 'number',
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
      ],
      expressions: {
        hide: () => THIS._router.url.includes('add'),
      },
    },
  ];
}
