import { FormlyFieldConfig } from '@ngx-formly/core';
import { ClientDetailsContactsEditorComponent } from './client-details-contacts-editor.component';

export function clientDetailsContactEditorFormlyConfig(
  THIS: ClientDetailsContactsEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid grid-cols-2 gap-4',
      fieldGroup: [
        {
          key: 'firstName',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('clients.firstName'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'lastName',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('clients.lastName'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'position',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('clients.position'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'email',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('clients.emai'),
            required: true,
            type: 'email',
            placeholder: 'name@email.com',
          },
          validators: {
            validation: ['email'],
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'phone',
          type: 'phone',
          props: {
            label: THIS._languageService.getTransValue('clients.phone'),
          },
         hooks: {
            onInit: (field) => {
              const control = field?.formControl;
              if (!control) return;

              control.valueChanges.subscribe((value: string) => {
                if (value && /[^0-9+ ]/.test(value)) {
                  const validValue = value.replace(/[^0-9+ ]/g, '');
                  control.setValue(validValue, { emitEvent: false });
                }
              });
            },
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'mobile',
          type: 'phone',
          props: {
            label: THIS._languageService.getTransValue('clients.mobile'),
          },
          hooks: {
            onInit: (field) => {
              const control = field?.formControl;
              if (!control) return;

              control.valueChanges.subscribe((value: string) => {
                if (value && /[^0-9+ ]/.test(value)) {
                  const validValue = value.replace(/[^0-9+ ]/g, '');
                  control.setValue(validValue, { emitEvent: false });
                }
              });
            },
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'fax',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('clients.fax'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'remarks',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('clients.remark'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
      ],
    },
  ];
}
