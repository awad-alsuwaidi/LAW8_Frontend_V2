import { FormlyFieldConfig } from '@ngx-formly/core';
import { QuickBillTimeFeesEditorComponent } from './quick-bill-time-fees-editor.component';

export function quickBillTimeFeesEditorFields(
  THIS: QuickBillTimeFeesEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName:
        'grid gap-4 md:grid-cols-3 bg-white rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          className: 'col-span-3',
          template: `<h5 class="mb-4 text-grey500 text-lg font-bold"> ${THIS._languageService.getTransValue(
            'billing.time/Fees'
          )}</h5>`,
        },
        {
          type: 'input',
          key: 'explanation',
          className: 'col-span-2  mb-3',
          props: {
            required:true,
            label: THIS._languageService.getTransValue('billing.explanation'),
          },
        },
        {
          type: 'number',
          key: 'amount',
          defaultValue: 0,
          className: 'col-md-2',
          props: {
            label: THIS._languageService.getTransValue('billing.amount'),
            pKeyFilter: 'int',
          },
        },
      ],
    },
  ];
}
