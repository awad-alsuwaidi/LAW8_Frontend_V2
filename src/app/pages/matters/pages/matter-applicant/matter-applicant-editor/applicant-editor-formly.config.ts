import { FormlyFieldConfig } from '@ngx-formly/core';
import { MatterApplicantEditorComponent } from './matter-applicant-editor.component';

export function applicantEditorFormlyConfig(
  THIS: MatterApplicantEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid grid-cols-2 gap-4',
      fieldGroup: [
        {
          key: 'firstName',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('matters.firstName'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'lastName',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('matters.lastName'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'position',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('matters.position'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'email',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('matters.email'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'address',
          type: 'input',
          className: 'col-span-2',
          hide: THIS._router.url.includes('client'),
          props: {
            label: THIS._languageService.getTransValue('matters.address'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'phone',
          type: 'phone',
          props: {
            label: THIS._languageService.getTransValue('matters.phone'),
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
          key: 'mobileNumber',
          type: 'phone',
          props: {
            label: THIS._languageService.getTransValue('matters.mobile'),
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
            label: THIS._languageService.getTransValue('matters.fax'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'remarks',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('matters.remark'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
      ],
    },
  ];
}
