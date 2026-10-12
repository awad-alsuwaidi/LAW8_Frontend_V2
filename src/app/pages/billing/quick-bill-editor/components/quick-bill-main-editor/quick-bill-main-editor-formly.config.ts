import { FormlyFieldConfig } from '@ngx-formly/core';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { QuickBillMainEditorComponent } from './quick-bill-main-editor.component';

export function quickBillMainEditorFields(
  THIS: QuickBillMainEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName:
        'grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-white rounded-2xl shadow-md my-6 p-6',
      fieldGroup: [
        {
          className: 'col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-3',
          template: `
            <h5 class="mb-6 text-xl font-bold text-gray-700 border-b border-gray-200 pb-2">
              ${THIS._languageService.getTransValue('matters.mainInfo')}
            </h5>
          `,
        },
        {
          key: 'law_MatterId',
          type: 'select',
          className: 'col-span-1 sm:col-span-1',
          props: {
            label: THIS._languageService.getTransValue('matters.title'),
            placeholder: 'Select matter...',
            virtualScroll: false,
            optionsArr: [],
            required: true,
            loading: true,
            onChange: (e: DropdownChangeEvent) => {
              if (e?.value && e.value !== null && e.value !== '') {
                THIS.getMatterDetailsById(e.value);
                localStorage.setItem('selectedMatterId', e.value.toString());
              } else {
                localStorage.removeItem('selectedMatterId');
              }
            },
          },
        },
        {
          key: 'clientName',
          type: 'input',
          className: 'col-span-1 sm:col-span-1',
          props: {
            label: THIS._languageService.getTransValue(THIS.isInhouse ? 'billing.entityName' : 'billing.clientName'),
            disabled: true,
            placeholder: THIS._languageService.getTransValue(THIS.isInhouse? 'billing.entityNameAuto': 'billing.clientNameAuto'),
          },
        },
        {
          key: 'invoiceNumber',
          type: 'input',
          className: 'col-span-1 sm:col-span-1',
          props: {
            label: THIS._languageService.getTransValue('billing.invoiceNumber'),
            placeholder: 'Enter invoice number',
            pKeyFilter: 'int',
            iconClassStyle: 'p-input-icon-right',
            onKeyUp: (e: number) => THIS.billInvoiceNumberCheck(e),
          },
        },
        {
          key: 'templetId',
          type: 'select',
          className: 'col-span-1 sm:col-span-1',
          props: {
            label: THIS._languageService.getTransValue('billing.template'),
            placeholder: 'Choose template...',
            required: true,
            optionsArr: [],
            loading: true,
          },
        },
        {
          key: 'date',
          type: 'date',
          className: 'col-span-1 sm:col-span-1',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('billing.a/RDate'),
          },
        },
      ],
    },
  ];
}
