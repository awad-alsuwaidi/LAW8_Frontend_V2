import { FormlyFieldConfig } from '@ngx-formly/core';
import { SharedContactEditorComponent } from './shared-contact-editor.component';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';

export function contactEditorFormlyConfig(
  THIS: SharedContactEditorComponent,
): FormlyFieldConfig[] {
  const lang = (THIS._languageService.getSelectedLanguage() || '').toLowerCase();
  const nameKey = lang.startsWith('en') ? 'nameEn' : 'nameAr';

  // 🔑 بنجهز الـ options مرة واحدة هنا قبل بناء الـ fields
  const categoryOptions = getOptionsArray(
    THIS.lookupsData?.category || [],
    'id',
    nameKey,
  );

  return [
    {
      fieldGroupClassName: 'grid grid-cols-2 gap-4',
      fieldGroup: [
        {
          key: 'firstName',
          type: 'input',
          props: {
            optionsArr: [],
            label: THIS._languageService.getTransValue('clients.firstName'),
            required: true,
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'lastName',
          type: 'input',
          props: {
            optionsArr: [],
            label: THIS._languageService.getTransValue('clients.lastName'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
{
  key: 'categoryId',
  type: 'select',
  hideExpression: (_model: any, formState: any) => !!formState?.isViewMode,
  props: {
    label: THIS._languageService.getTransValue('common.category'),
    optionsArr: categoryOptions,
    options: categoryOptions,   // ✅ fallback لو الـ select بيقرأ من props.options
    required: true,
  },
  expressions: {
    'props.readonly': 'formState.readonly',
  },
},
        {
          key: 'categoryName',
          type: 'input',
          hideExpression: (_model: any, formState: any) =>
            !formState?.isViewMode,
          props: {
            label: THIS._languageService.getTransValue('common.category'),
            readonly: true,
          },
        },
        {
          key: 'position',
          type: 'input',
          props: {
            optionsArr: [],
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
            label: THIS._languageService.getTransValue('clients.email'),
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
          key: 'address',
          type: 'input',
          props: {
            optionsArr: [],
            label: THIS._languageService.getTransValue('common.address'),
            required: true,
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'phone',
          type: 'phone',
          props: {
            optionsArr: [],
            label: THIS._languageService.getTransValue('clients.phone'),
            required: true,
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
            optionsArr: [],
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
            optionsArr: [],
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
            optionsArr: [],
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