import { ClientsEditorContactComponent } from './clients-editor-contact.component';
import { FormlyFieldConfig } from '@ngx-formly/core';

export function clientsEditorContactFormlyFieldsConfig(
  THIS: ClientsEditorContactComponent
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
          key: 'mobile1',
          type: 'phone',
          className: 'md:col-span-2',
          props: {
            label: THIS._languageService.getTransValue('clients.mobile1'),
            placeholder: '+971 5XXXXXXXX',
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
          key: 'mobile2',
          type: 'phone',
          className: 'md:col-span-2',
          props: {
            label: THIS._languageService.getTransValue('clients.mobile2'),
            placeholder: '+971 5XXXXXXXX',
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
      ],
    },
    {
      fieldGroupClassName: isView
        ? 'grid md:grid-cols-6 grid-cols-2 gap-4 mb-4'
        : 'grid md:grid-cols-6 gap-4 mb-4',
      fieldGroup: [
        {
          key: 'phone1',
          type: 'phone',
          className: 'md:col-span-2',
          props: {
            label: THIS._languageService.getTransValue('clients.phone1'),
            placeholder: '+971 XXXXXXXXX',
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
          key: 'phone2',
          type: 'phone',
          className: 'md:col-span-2',
          props: {
            label: THIS._languageService.getTransValue('clients.phone2'),
            placeholder: '+971 XXXXXXXXX',
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
      ],
    },
    {
      fieldGroupClassName: isView
        ? 'grid md:grid-cols-6 grid-cols-2 gap-4 mb-4'
        : 'grid md:grid-cols-6 gap-4 mb-4',
      fieldGroup: [
        {
          key: 'email',
          type: 'input',
          className: 'md:col-span-2',
          props: {
            label: THIS._languageService.getTransValue('clients.email1'),
            placeholder: 'name@mail.com',
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
          validators: {
            validation: ['email'],
          },
        },
        {
          key: 'email2',
          type: 'input',
          className: 'md:col-span-2',
          props: {
            label: THIS._languageService.getTransValue('clients.email2'),
            placeholder: 'name@mail.com',
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
          validators: {
            validation: ['email'],
          },
        },
      ],
    },
  ];
}
