import { FormlyFieldConfig } from '@ngx-formly/core';
import { MatterBillingRateExceptionEditorComponent } from './matter-billing-rate-exception-editor.component';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';

export function matterAddressFormlyFields(
  THIS: MatterBillingRateExceptionEditorComponent
): FormlyFieldConfig[] {
  const isViewMode = THIS._dynamicDialogConfig?.data?.viewMode ?? false;
  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-2',
      fieldGroup: [
        {
          key: 'lawyerId',
          type: 'select',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('Lawyer Name'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.lawyer.result,
              'id',
              'name'
            ),
            required: true,
            disabled: isViewMode,
          },
        },
        {
          key: 'taskCodeId',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('Task Code'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.taskCode.result,
              'id',
              'name'
            ),
            required: true,
            disabled: isViewMode,
          },
        },
        {
          key: 'rateAmount',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('Rate Amount'),
            required: true,
            disabled: isViewMode,
          },
        },
      ],
    },
  ];
}
