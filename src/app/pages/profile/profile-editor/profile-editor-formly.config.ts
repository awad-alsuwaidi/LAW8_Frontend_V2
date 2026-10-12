import { FormlyFieldConfig } from '@ngx-formly/core';
import { ProfileEditorComponent } from './profile-editor.component';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';

export function profileBaseEditorFormlyConfig(
  THIS: ProfileEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid md:grid-cols-3 gap-x-6 gap-y-4',
      fieldGroup: [
        {
          key: 'FileName',
          type: 'upload-image',
          props: {
            label: THIS._languageService.getTransValue('profile.profile_photo'),
          },
        },
        {
          className: 'md:col-span-2',
          fieldGroupClassName: 'grid md:grid-cols-2  gap-x-6 gap-y-4',
          fieldGroup: [
            {
              key: 'name',
              type: 'input',
              props: {
                label: THIS._languageService.getTransValue('profile.name'),
                disabled: true,
              },
            },
            {
              key: 'email',
              type: 'input',
              props: {
                label: THIS._languageService.getTransValue('profile.email'),
                // required: true,
                type: 'email',
                placeholder: 'name@email.com',
                disabled: true,
              },
              validators: {
                validation: ['email'],
              },
              expressions: {
                'props.readonly': 'formState.readonly',
              },
            },
            {
              key: 'mobileNo',
              type: 'phone',
              props: {
                label: THIS._languageService.getTransValue('profile.mobile'),
                                disabled:true,

              },
              hooks: {
                onInit: (field) => {
                  const control = field?.formControl;
                  if (!control) return;

                  control.valueChanges.subscribe((value: string) => {
                    if (value && /[^0-9]/.test(value)) {
                      const numericOnly = value.replace(/[^0-9]/g, '');
                      control.setValue(numericOnly, { emitEvent: false });
                    }
                  });
                },
              },
            },
            {
              key: 'role',
              type: 'input',
              props: {
                label: THIS._languageService.getTransValue('profile.role'),
                 disabled:true,
              },
            },
            {
              key: 'department',
              type: 'input',
              props: {
                label: THIS._languageService.getTransValue('profile.team'),
                                disabled:true,
                optionsArr: getOptionsArray(
                  THIS.lookupsData?.department?.result,
                  'id',
                  'name'
                ),
              },
            },
           
//             {
//   key: 'DashBoardTempletId',
//   type: 'select',
//   props: {
//     showFilter: false,
//     label: 'Default Dashboard',
//     optionsArr: [
//       { label: 'Dashboard Mode 1', value: 1 },
//       { label: 'Dashboard Mode 2', value: 2 },
//       { label: 'Manager Mode', value: 3 },
//     ],
//   },
// },

{
  className: 'col-span-2', 
  fieldGroup: [

    {
      template: `
        <div class="mt-2 mb-2">
          <div class="border-t border-gray-200 mb-2"></div>
          <p class="text-xs text-gray-400 font-semibold uppercase">
          </p>
        </div>
      `
    },

    {
      fieldGroupClassName: 'grid md:grid-cols-2 gap-6',
      fieldGroup: [

        {
          key: 'defUsrId',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('profile.default_user_id'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.defUsr.result,
              'id',
              'name'
            ),
          },
        },

        {
          key: 'dashBoardTempletId',
          type: 'select',
          props: {
            label: 'Default Dashboard',
            showFilter:false,
            optionsArr: THIS.dashboardTemplateOptions,
          },
        },

      ]
    }

  ]
}
          ],
        },
      ],
    },
  ];
}
export function profilePersonalEditorFormlyConfig(
  THIS: ProfileEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid grid-cols-1 md:grid-cols-6 gap-4',
      fieldGroup: [
        {
          key: 'address',
          type: 'input',
          className: 'col-span-6 md:col-span-4',
          props: {
            label: THIS._languageService.getTransValue('profile.address'),
          },
        },
        {
          key: 'zipCode',
          type: 'input',
          className: 'col-span-6 md:col-span-2',
          props: {
            label: THIS._languageService.getTransValue('profile.zipCode'),
          },
        },
        {
          key: 'Law_CountryId',
          type: 'select',
          className: 'col-span-6 md:col-span-2',
          props: {
            label: THIS._languageService.getTransValue('profile.country'),
            optionsArr: getOptionsArray(
              THIS.lookupsData?.country?.result,
              'id',
              'name'
            ),
          },
        },
        {
          key: 'city',
          type: 'input',
          className: 'col-span-6 md:col-span-2',
          props: {
            label: THIS._languageService.getTransValue('profile.city'),
          },
        },
        {
          key: 'state',
          type: 'input',
          className: 'col-span-6 md:col-span-2',
          props: {
            label: THIS._languageService.getTransValue('profile.state'),
          },
        },
      ],
    },
  ];
}
