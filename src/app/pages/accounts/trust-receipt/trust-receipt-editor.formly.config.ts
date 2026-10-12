import { FormlyFieldConfig } from '@ngx-formly/core';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { TrustReceiptEditorComponent } from './trust-receipt-editor.component';

const showOnTouchOrSubmit = "formState.isSubmitted || formControl.touched";

const nf = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = (v: any) => nf.format(Number(v ?? 0) || 0);

export function trustReceiptEditorFields(
  THIS: TrustReceiptEditorComponent
): FormlyFieldConfig[] {
  return [
    {
     fieldGroupClassName: 'grid gap-2 lg:grid-cols-12 items-start',
      fieldGroup: [
        // ================= LEFT =================
        {
          className: 'lg:col-span-8',
          fieldGroup: [
            // ----- Receipt Details -----
            {
fieldGroupClassName: 'relative overflow-hidden grid gap-4 md:grid-cols-4 bg-white rounded-2xl my-4 p-6',
fieldGroup: [
    {
        className: 'col-span-4',
        template: `<h5 class="text-grey500 text-lg font-bold mb-1">Receipt Details</h5>`
    },
    //  <p class="text-grey400 text-xs m-0">Receipt No is auto-generated and not editable</p>`,
                {
                  key: 'trustAccountId',
                  type: 'select',
                  props: {
                    label: 'Bank Account',
                    showFilter: false,
                    required: true,
                    clearable: false,
                    optionsArr: THIS.lookupsData?.accounts?.result
                      ? getOptionsArray(THIS.lookupsData.accounts.result, 'id', 'name')
                      : [{ id: '1', name: 'Demo Account (static)' }],
                  },
                  expressionProperties: { 'validation.show': showOnTouchOrSubmit },
                },
                {
                  key: 'recepitNumber',
                  type: 'input',
                  props: { label: 'Receipt No', disabled: true },
                },
                {
                  key: 'amount',
                  type: 'number',
                  defaultValue: 0,
                  props: {
                    label: 'Amount',
                    required: true,
                    min: 0,
                    onInput: () => THIS.recalc(),
                  },
                  expressionProperties: { 'validation.show': showOnTouchOrSubmit },
                },
                {
                  key: 'date',
                  type: 'date',
                  defaultValue: new Date(),
                  props: { label: 'Date', required: true },
                  expressionProperties: { 'validation.show': showOnTouchOrSubmit },
                },
                {
                  key: 'receivedFrom',
                  type: 'input',
                  props: { label: 'Receieved From', required: true },
                  expressionProperties: { 'validation.show': showOnTouchOrSubmit },
                },
                {
                  key: 'paymentMethodId',
                  type: 'select',
                  props: {
                    showFilter: false,
                    label: 'Payment Method',
                    required: true,
                    clearable: false,
                    optionsArr: THIS.lookupsData?.payments?.result
                      ? getOptionsArray(THIS.lookupsData.payments.result, 'id', 'name')
                      : [{ id: '1', name: 'Cash (static)' }],
                  },
                  expressionProperties: { 'validation.show': showOnTouchOrSubmit },
                },
                { key: 'clientCheck', type: 'input', props: { label: 'Client Check' } },
                // { key: 'originalBank', type: 'input', props: { label: 'Original Bank' } },
                {
                  key: 'note',
                  type: 'textarea',
                  className: 'col-span-4',
                  props: { 
                    label: THIS._languageService.getTransValue('billing.explanation'),
                    rows: 3 },
                },
              ],
            },

            // ----- Matter Allocation -----
            {
              fieldGroupClassName: 'rounded-2xl my-4 p-6',
              fieldGroup: [
                {
                  template: `<h5 class="text-grey500 text-lg font-bold mb-4">Matter Allocation</h5>`,
                },

                {
                  key: 'details',
                  type: 'repeat-alloc', 
                  props: {
                    addText: '+ Add Matter Allocation',
                    removeText: 'Remove',
                  },

                  fieldArray: {
                    fieldGroup: [
                      {
                        key: 'matterId',
                        type: 'select',
                        className: 'col-span-12 md:col-span-5',
                        props: {
                          label: '',               
                          placeholder: 'Matter',   
                          required: true,
                          clearable: false,
                          optionsArr: THIS.mattersOptions?.length
                            ? getOptionsArray(THIS.mattersOptions, 'id', 'name')
                            : [{ id: '101', name: 'MAT-101 | Static Matter' }],
                        },
                        expressionProperties: { 'validation.show': showOnTouchOrSubmit },
                        hooks: {
                          onInit: (field) => {
                            field?.formControl?.valueChanges
                              ?.pipe(THIS._unsubscribe.takeUntilDestroy())
                              .subscribe((mid: any) => {
                                THIS.ensureMatterBalanceLoaded(mid).subscribe({
                                  next: () => THIS.recalc(),
                                });
                              });
                          },
                        },
                      },
                      {
                        key: 'allocationCodeId',
                        type: 'select',
                        defaultValue: THIS.allocationCodesOptions?.[0]?.id ?? '1',
                        hide: true,
                        props: {
                        //   required: true,
                          clearable: false,
                          optionsArr: THIS.allocationCodesOptions?.length
                            ? getOptionsArray(THIS.allocationCodesOptions, 'id', 'name')
                            : [{ id: '1', name: 'Retainer (static)' }],
                        },
                      },
                      { key: 'explanation', type: 'input', hide: true },
                      { key: 'description', type: 'input', hide: true },

                      // Amount
                      {
                        key: 'amount',
                        type: 'number',
                        defaultValue: 0,
                        className: 'col-span-12 md:col-span-3',
                        props: {
                          label: '',
                          placeholder: 'Amount',
                          min: 0,
                          required: true,
                          onInput: () => THIS.recalc(),
                        },
                        expressionProperties: { 'validation.show': showOnTouchOrSubmit },
                      },
                      {
                        key: 'newBalance',
                        type: 'number',
                        className: 'col-span-12 md:col-span-3',
                        props: {
                          label: '',
                          placeholder: 'New Balance',
                          disabled: true,
                        },
                      },
                    ],
                  },
                },
                {
                  fieldGroupClassName: 'grid gap-4 md:grid-cols-3 mt-6',
                  fieldGroup: [
                    {
                      expressionProperties: {
                        template: (model: any) => `
                          <div class="rounded-2xl border border-grey200 bg-white p-4">
                            <div class="text-grey400 text-xs mb-1">Total Amount</div>
                            <div class="text-colorsTextTextPrimary font-bold text-xl">${money(model?.amount)}</div>
                          </div>
                        `,
                      },
                    },
                    {
                      expressionProperties: {
                        template: (model: any) => `
                          <div class="rounded-2xl border border-grey200 bg-white p-4">
                            <div class="text-grey400 text-xs mb-1">Total Allocated</div>
                            <div class="text-colorsTextTextPrimary font-bold text-xl">${money(model?.totalAllocated)}</div>
                          </div>
                        `,
                      },
                    },
                    {
                      expressionProperties: {
                        template: (model: any) => `
                          <div class="rounded-2xl border border-grey200 bg-white p-4">
                            <div class="text-grey400 text-xs mb-1">Unallocated</div>
                            <div class="text-colorsTextTextPrimary font-bold text-xl">${money(model?.unAllocated)}</div>
                          </div>
                        `,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
            className: ' lg:col-span-4 bg-white rounded-2xl my-4 p-6',
          fieldGroup: [
            {
              fieldGroupClassName: 'rounded-2xl mt-4 p-6 h-fit lg:sticky lg:top-4',
              fieldGroup: [
                { template: `<h5 class="text-grey500 text-lg font-bold mb-4">Summary</h5>` },
                {
                  key: 'totalAllocated',
                  type: 'number',
                  props: { label: 'Total allocated', disabled: true },
                },
                {
                  key: 'unAllocated',
                  type: 'number',
                  props: { label: 'Unallocated', disabled: true },
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}
