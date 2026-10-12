import { FormlyFieldConfig } from '@ngx-formly/core';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { PreBillMainEditorComponent } from './pre-bill-main-editor.component';

export function preBillsMainEditorFields(
  THIS: PreBillMainEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName:
        'grid gap-6 md:grid-cols-2 xl:grid-cols-3 bg-white rounded-2xl my-6 p-6 shadow-sm',
      fieldGroup: [
        {
          className: 'col-span-full',
          template: `
            <h5 class="mb-6 text-[#859090] text-xl font-bold border-b border-gray-200 pb-2">
              ${THIS._languageService.getTransValue('matters.mainInfo')}
            </h5>
          `,
        },
        {
          key: 'law_MatterId',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('matters.title'),
            placeholder: 'Select matter...',
            virtualScroll: false,
            required: true,
            optionsArr: [],
            panelStyleClass: 'matter-dropdown-panel',
            onChange: (e: DropdownChangeEvent) =>
              THIS.getMatterDetailsById(e.value),
          },
        },
        {
          key: 'clientName',
          type: 'input',
          props: {
              label: THIS._languageService.getTransValue(THIS.isInhouse ? 'billing.entityName' : 'billing.clientName'),
              disabled: true,
          },
        },
        {
          key: 'invoiceNumber',
          type: 'input',
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
          props: {
            label: THIS._languageService.getTransValue('billing.template'),
            placeholder: 'Choose template...',
            required: true,
            optionsArr: [],
          },
        },
        {
          key: 'date',
          type: 'date',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('billing.a/RDate'),
          },
        },
      ],
    },
  ];
}
