import { FormlyFieldConfig } from '@ngx-formly/core';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { recievePaymentInvoicesColumns } from './recieve-payment-reference-columns.config';

import { RecievePaymentEditorComponent } from './recieve-payment-editor.component';
import { getInvoiceFormFields } from './recieve-payment-invoice-formly.config';
import { DropdownChangeEvent } from 'primeng/dropdown';

export function recievePaymentReferenceEditorFields(
  THIS: RecievePaymentEditorComponent,
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName:
        'grid gap-4 md:grid-cols-3 bg-white rounded-2xl my-4 p-6 items-end',
      fieldGroup: [
        {
          className: 'col-span-3',
          template: `<h5 class="mb-4 text-grey500 text-lg font-bold"> ${THIS._languageService.getTransValue(
            'Reference',
          )}</h5>`,
        },
        {
          type: 'radio',
          key: 'reference',
          defaultValue: THIS._languageService.getTransValue('Matter'),
          props: {
            label: THIS._languageService.getTransValue('Reference Type'),
            options: [
              {
                label: THIS._languageService.getTransValue('Invoice'),
                value: THIS._languageService.getTransValue('Invoice'),
              },
              {
                label: THIS._languageService.getTransValue('Client'),
                value: THIS._languageService.getTransValue('Client'),
              },
              {
                label: THIS._languageService.getTransValue('Matter'),
                value: THIS._languageService.getTransValue('Matter'),
              },
            ],
            onChange: (e: DropdownChangeEvent) => {
              if (e.value === THIS._languageService.getTransValue('Matter')) {
                THIS.getMatters();
              }
              if (e.value === THIS._languageService.getTransValue('Client')) {
                THIS.getClients();
              }
              if (e.value === THIS._languageService.getTransValue('Invoice')) {
                THIS.getInvoices();
              }
            },
          },
        },
        {
          key: 'matterId',
          type: 'select',
          props: {
            label: 'Matter',
            virtualScroll: true,
            optionsArr: [],
          },
          hideExpression: (model) =>
            model.reference !== THIS._languageService.getTransValue('Matter'),
        },

        {
          key: 'clientId',
          type: 'select',
          props: {
            label: 'Client',
            optionsArr: [],
            onChange: (e: any) => {
              const fromNameControl = THIS.formly.get('fromName');
              if (fromNameControl) {
                fromNameControl.patchValue(e.value?.label?.split('|')[1]);
              }
            },
          },
          hideExpression: (model) =>
            model.reference !== THIS._languageService.getTransValue('Client'),
        },
        {
          key: 'invoiceId',
          type: 'select',
          props: {
            label: 'Invoice',
            optionsArr: [],
          },
          hideExpression: (model) =>
            model.reference !== THIS._languageService.getTransValue('Invoice'),
        },
        // {
        //   type: 'button',
        //   className: 'flex justify-end',
        //   props: {
        //     label: 'Load',
        //     class:
        //       'text-primary border border-primary !px-8 !py-3 !w-[auto] h-10 !leading-3	!text-sm',
        //     onClick: () => THIS.getInvoiceList(),
        //   },
        // },
        {
          type: 'button',
          className: 'flex justify-end',
          props: {
            label: 'Load',
            class:
              'text-primary border border-primary !px-8 !py-3 !w-[auto] h-10 !leading-3 !text-sm',

            isLoading: THIS.isLoadingInvoices,
            disabled: THIS.isLoadingInvoices,

            onClick: () => THIS.getInvoiceList(),
          },
        },
        {
          key: 'invoicesDetails',
          type: 'table',
          className: 'col-span-3',
          props: {
            columns: recievePaymentInvoicesColumns,
            withClientPaginator: true,
          },
          fieldArray: {
            fieldGroup: getInvoiceFormFields(THIS),
          },
        },
      ],
    },
  ];
}
