import { FormlyFieldConfig } from '@ngx-formly/core';
import { FeesEditorComponent } from './fees-editor.component';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';

export function feesEditorFormlyFields(
  THIS: FeesEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName:
        'grid gap-4 md:grid-cols-2 bg-surfaceLevel2 rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          className: 'col-span-2',
          template: `<h5 class="mb-4 text-grey500 text-lg font-bold"> 
                        ${THIS._languageService.getTransValue('Fees')}
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
                label: THIS._languageService.getTransValue('timesheet.matter'),
                required: true,
                virtualScroll: true,
                optionsArr: getOptionsArray(
                  THIS.lookupsData?.matters?.result,
                  'id',
                  'name'
                ),
                onChange: (e: any) => {
                  const mtrNoControl = THIS.formly?.get('mtrNo');
                  if (mtrNoControl) {
                    mtrNoControl.setValue(
                      e?.option?.value?.name ||
                        e?.originalEvent?.target?.innerText
                    );
                  }
                },
              },
            },
            {
              key: 'mtrNo',
            },
            {
              key: 'law_LawerId',
              type: 'select',
              className: 'col-span-2',
              props: {
                label: THIS._languageService.getTransValue('timesheet.lawyer'),
                required: true,
                optionsArr: getOptionsArray(
                  THIS.lookupsData?.lawyers?.result,
                  'id',
                  'name'
                ),
              },
            },
            {
              key: 'amount',
              type: 'input',
              className: 'col-span-2',
              props: {
                label: THIS._languageService.getTransValue('billing.value'),
                pKeyFilter: 'int',
                required: true,
              },
            },
          ],
        },
        {
          fieldGroupClassName:
            'grid gap-4 md:grid-cols-2 p-6 bg-grey100 rounded-2xl',
          fieldGroup: [
            {
              key: 'tmDate',
              type: 'date',
              className: 'col-span-2',
              defaultValue: new Date().toISOString().split('T')[0],
              props: {
                label: THIS._languageService.getTransValue('timesheet.date'),
                required: true,
              },
            },
            {
              key: 'explanationExplanation',
              type: 'textarea',
              className: 'col-span-2',
              props: {
                label: THIS._languageService.getTransValue(
                  'billing.description'
                ),
                rows: 1,
                required: true,
              },
            },
   {
  key: 'holdId',
  type: 'select',
  className: 'col-4',
  props: {
    label: THIS._languageService.getTransValue('billing.hold'),
    optionsArr: getOptionsArray(
      THIS.lookupsData?.holds?.result,
      'id',
      'name'
    ),
    onChange: (e: any) => {
      const holdControl = THIS.formly?.get('hold');
      if (holdControl) {
        holdControl.setValue(e?.option?.label);
      }
    },
  },
  hideExpression: () => !THIS.isEditMode
},

   

            // {
            //   key: 'amount',
            //   type: 'input',
            //   className: 'col-span-2',
            //   props: {
            //     label: THIS._languageService.getTransValue('billing.value'),
            //     pKeyFilter: 'int',
            //     required: true,
            //   },
            // },
          ],
        },
      ],
    },
  ];
}
