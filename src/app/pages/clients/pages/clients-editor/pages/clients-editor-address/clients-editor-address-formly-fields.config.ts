import { FormlyFieldConfig } from '@ngx-formly/core';
import { ClientsEditorAddressComponent } from './clients-editor-address.component';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';

export function clientsEditorAddressFormlyFieldsConfig(
  THIS: ClientsEditorAddressComponent
): FormlyFieldConfig[] {
  const isView =
    THIS._router.url.includes('view') || THIS._router.url.includes('details');
  return [
    {
      fieldGroupClassName: isView
        ? 'grid md:grid-cols-6 grid-cols-2 gap-4 mb-4'
        : 'grid md:grid-cols-6 gap-4 mb-4',
      fieldGroup: [
        {
          key: 'address1',
          type: 'input',
          className: 'md:col-span-4',
          props: {
            label: THIS._languageService.getTransValue('clients.address1'),
            placeholder:
              THIS._languageService.getTransValue('clients.address1') + ' ...',
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'zIpCode',
          type: 'input',
          className: 'md:col-span-2',
          props: {
            label: THIS._languageService.getTransValue('clients.zipCode'),
            placeholder: '12345',
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
{
  key: 'countryId',
  type: 'select',
  className: 'md:col-span-2',
  props: {
    label: THIS._languageService.getTransValue('clients.country'),
    optionsArr: THIS.lookupsData?.country?.result ?? [],
    optionLabel: 'name',
    optionValue: 'id',
    selectedObj: null,
    placeholder:
      THIS._languageService.getTransValue('clients.selectCountry') + ' ...',
  },
  expressions: {
    'props.disabled': 'formState.readonly',
    'hide': 'formState.readonly',
  },
},
{
  key: 'countryName',
  type: 'input',
  className: 'md:col-span-2',
  props: {
    label: THIS._languageService.getTransValue('clients.country'),
  },
  expressions: {
    'hide': '!formState.readonly',
    'props.readonly': 'true',
    'model.countryName': 'model.country?.name || model.countryName',
  },
}

, {
          key: 'city',
          type: 'input',
          className: 'md:col-span-2',
          props: {
            label: THIS._languageService.getTransValue('clients.city'),
            placeholder:
              THIS._languageService.getTransValue('clients.city') + ' ...',
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'state',
          type: 'input',
          className: 'md:col-span-2',
          props: {
            label: THIS._languageService.getTransValue('clients.state'),
            placeholder:
              THIS._languageService.getTransValue('clients.state') + ' ...',
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
      ],
    },
  ];
}
