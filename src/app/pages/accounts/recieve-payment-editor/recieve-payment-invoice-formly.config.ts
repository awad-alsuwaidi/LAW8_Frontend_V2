// import { FormlyFieldConfig } from '@ngx-formly/core';
// import { RecievePaymentEditorComponent } from './recieve-payment-editor.component';

// export function getInvoiceFormFields(
//   THIS: RecievePaymentEditorComponent
// ): FormlyFieldConfig[] {
//   return [
//     {
//       key: 'date',
//       type: 'input',

//       className: 'readonly-input',
//       props: {
//         readonly: true,
//       },
//     },
//     {
//       key: 'invoiceNumber',
//       type: 'input',

//       className: 'readonly-input',
//       props: {
//         readonly: true,
//       },
//     },
//     {
//       key: 'matter',
//       type: 'input',

//       className: 'readonly-input',
//       props: {
//         readonly: true,
//       },
//     },
//     {
//       key: 'totalFees',
//       type: 'input',

//       className: 'readonly-input',
//       props: {
//         readonly: true,
//       },
//     },
//     {
//       key: 'taxes',
//       type: 'input',

//       className: 'readonly-input',
//       props: {
//         readonly: true,
//       },
//     },
//     {
//       key: 'disb',
//       type: 'input',

//       className: 'readonly-input',
//       props: {
//         readonly: true,
//       },
//     },
//     {
//       key: 'taxe',
//       type: 'input',

//       className: 'readonly-input',
//       props: {
//         readonly: true,
//       },
//     },
//     {
//       key: 'paid',
//       type: 'input',

//       className: 'readonly-input',
//       props: {
//         readonly: true,
//       },
//     },
//     {
//       key: 'payment',
//       type: 'input',
//       className: 'editable-input',
//       defaultValue: 0,
//       props: {
//         pKeyFilter: 'int',
//         input: () => {
//           THIS.checkMoreThanAmount();
//         },
//       },
//       expressions: {
//         'props.disabled': () => {
//           return (
//             THIS.formlyModel.amount === null ||
//             THIS.formlyModel.amount === undefined
//           );
//         },
//       },
//     },
//   ];
// }

import { FormlyFieldConfig } from '@ngx-formly/core';
import { RecievePaymentEditorComponent } from './recieve-payment-editor.component';

function readonlyMoneyField(key: string): FormlyFieldConfig {
  return {
    key,
    type: 'input',
    className: 'readonly-input',
    props: {
      readonly: true,
    },
    expressions: {
      'formControl.value': (field: any) => {
        const value = field.model?.[key];
        return Number(value ?? 0).toFixed(2);
      },
    },
  };
}

export function getInvoiceFormFields(
  THIS: RecievePaymentEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      key: 'date',
      type: 'input',
      className: 'readonly-input',
      props: {
        readonly: true,
      },
    },
    {
      key: 'invoiceNumber',
      type: 'input',
      className: 'readonly-input',
      props: {
        readonly: true,
      },
    },
    {
      key: 'matter',
      type: 'input',
      className: 'readonly-input',
      props: {
        readonly: true,
      },
    },

    readonlyMoneyField('totalFees'),
    readonlyMoneyField('taxes'),
    readonlyMoneyField('disb'),
    readonlyMoneyField('taxe'),
    readonlyMoneyField('grandTotal'),
    readonlyMoneyField('paid'),
    readonlyMoneyField('remain'),

    {
      key: 'payment',
      type: 'input',
      className: 'editable-input',
      defaultValue: 0,
      props: {
        pKeyFilter: 'int',
        input: () => {
          THIS.checkMoreThanAmount();
        },
      },
      expressions: {
        'props.disabled': () => {
          return (
            THIS.formlyModel.amount === null ||
            THIS.formlyModel.amount === undefined
          );
        },
      },
    },
  ];
}