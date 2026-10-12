import { FormlyFieldConfig } from '@ngx-formly/core';
import { MatterAddressEditorComponent } from './matter-address-editor.component';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';

export function matterAddressFormlyFields(
  THIS: MatterAddressEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-2',
      fieldGroup: [
        {
          key: 'line1',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('matters.addressLine1'),
            required: true,
          },
        },
        {
          key: 'line2',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('matters.addressLine2'),
            required: true,
          },
        },
        {
          key: 'zipCode',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('matters.zipCode'),
          },
        },
        {
          key: 'countryId',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('matters.country'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.country.result,
              'id',
              'name'
            ),
            onChange: (e: any) => {
              THIS.formly
                ?.get('country')
                ?.setValue(e?.originalEvent.target.innerText);
            },
          },
        },
        {
          key: 'country',
        },
        {
          key: 'city',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('matters.city'),
          },
        },
        {
          key: 'state',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('matters.state'),
          },
        },
      ],
    },
  ];
}
