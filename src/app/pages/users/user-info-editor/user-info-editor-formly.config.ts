import { FormlyFieldConfig } from '@ngx-formly/core';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { UserInfoEditorComponent } from './user-info-editor.component';

export function userDetailsEditorFields(
  THIS: UserInfoEditorComponent,
): FormlyFieldConfig[] {
  const isEn = THIS._languageService.getSelectedLanguage() == 'en';
  const nameKey = isEn ? 'nameEn' : 'nameAr';
  const isAddOrUpdate = ['add', 'update'].some((word) =>
    THIS._router.url.includes(word),
  );
  const isAdd = ['add'].some((word) => THIS._router.url.includes(word));
  const isViewList = ['view-list'].some((word) =>
    THIS._router.url.includes(word),
  );
  return [
    {
      fieldGroupClassName:
        'grid gap-4 md:grid-cols-3 bg-white rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          className: 'col-span-3',
          template: `<h5 class="mb-4 text-grey500 text-lg font-bold">
        ${THIS._languageService.getTransValue('matters.mainInfo')}
      </h5>`,
        },
        {
          className: 'col-span-3',
          fieldGroupClassName: 'grid gap-4 md:grid-cols-3',
          fieldGroup: [
            ...(isEn
              ? [
                  {
                    key: 'nameEn',
                    type: 'input',
                    props: {
                      label:
                        THIS._languageService.getTransValue('lookups.nameEN1'),
                      required: isEn && isAddOrUpdate,
                      readonly: !isAddOrUpdate,
                      minLength: 3,
                      maxLength: 100,
                    },
                    validators: { validation: ['englishLetters'] },
                  },

                  // Arabic Name
                  {
                    key: 'nameAr',
                    type: 'input',
                    props: {
                      label:
                        THIS._languageService.getTransValue('lookups.nameAR1'),
                      required: !isEn && isAddOrUpdate,
                      readonly: !isAddOrUpdate,
                      minLength: 3,
                      maxLength: 100,
                    },
                    validators: { validation: ['arabicLetters'] },
                  },
                ]
              : [
                  {
                    key: 'nameAr',
                    type: 'input',
                    props: {
                      label:
                        THIS._languageService.getTransValue('lookups.nameAR1'),
                      required: !isEn && isAddOrUpdate,
                      readonly: !isAddOrUpdate,
                      minLength: 3,
                      maxLength: 100,
                    },
                    validators: { validation: ['arabicLetters'] },
                  },

                  {
                    key: 'nameEn',
                    type: 'input',
                    props: {
                      label:
                        THIS._languageService.getTransValue('lookups.nameEN1'),
                      required: isEn && isAddOrUpdate,
                      readonly: !isAddOrUpdate,
                      minLength: 3,
                      maxLength: 100,
                    },
                    validators: { validation: ['englishLetters'] },
                  },
                ]),
            {
              type: 'input',
              key: 'userName',
              props: {
                label: THIS._languageService.getTransValue('common.username'),
                readonly: !isAddOrUpdate,
                required: true,
                placeholder: 'Enter username',
                minLength: 4,
                maxLength: 20,
                pattern: '^[a-zA-Z0-9_]+$',
              },
              validation: {
                messages: {
                  required: () => 'Username is required',
                  minlength: () => 'At least 4 characters',
                  maxlength: () => 'Maximum 20 characters',
                  pattern: () =>
                    'Only letters, numbers, and underscore (_) allowed',
                },
              },
            },
            {
              type: 'input',
              key: 'initial',
              props: {
                label: THIS._languageService.getTransValue('common.initial'),
                readonly: !isAddOrUpdate,
                required: true,
                maxLength: 4,
              },
              validation: {
                messages: {
                  required: () => 'Initial is required',
                  maxlength: () => 'Maximum 4 characters only',
                },
              },
            },
            {
              type: 'select',
              key: 'industryId',
              props: {
                label: THIS._languageService.getTransValue('common.industry'),

                optionsArr: getOptionsArray(
                  THIS.lookupsData.industry.result,
                  'id',
                  nameKey,
                ),

                readonly: !isAddOrUpdate,
                required: true,
              },
            },
            {
              type: 'select',
              key: 'titleId',
              props: {
                label: THIS._languageService.getTransValue('users.titleuser'),
                optionsArr: getOptionsArray(
                  THIS.lookupsData.rateType.result,
                  'id',
                  nameKey,
                ),

                readonly: !isAddOrUpdate,
                required: true,
                onChange: (e: DropdownChangeEvent) =>
                  THIS.toggleDefaultRateApprove(e),
              },
            },
            {
              type: 'select',
              key: 'departmentId',
              props: {
                label: THIS._languageService.getTransValue('common.department'),

                optionsArr: getOptionsArray(
                  THIS.lookupsData.department.result,
                  'id',
                  nameKey,
                ),

                readonly: !isAddOrUpdate,
                required: true,
              },
            },
            {
              type: 'password',
              key: 'password',
              props: {
                label: THIS._languageService.getTransValue('common.password'),
                class: 'h-11',
                required: true,
                feedback: false,
              },
              validators: { validation: ['password'] },
              validation: {
                messages: {
                  required: () =>
                    THIS._languageService.getTransValue('validation.required'),
                  password: () =>
                    THIS._languageService.getTransValue('validation.password'),
                },
              },
              expressions: { hide: () => !isAdd },
            },
            {
              type: 'select',
              key: 'defaultUserId',
              className: 'col-md-4',
              props: {
                label: THIS._languageService.getTransValue('profile.defUsrId'),
                optionsArr: getOptionsArray(
                  THIS.lookupsData.defUsrId.result,
                  'id',
                  nameKey,
                ),

                readonly: !isAddOrUpdate,
              },
            },
            {
              type: 'radio',
              key: 'locked',
              props: {
                label: THIS._languageService.getTransValue('users.locked'),
                options: [
                  {
                    label: THIS._languageService.getTransValue('common.no'),
                    value: false,
                  },
                  {
                    label: THIS._languageService.getTransValue('common.yes'),
                    value: true,
                  },
                ],
                onChange: (e: any) => THIS.toggleLockedeUser(e.value),
                disabled:
                  !THIS._permissionService.hasPermission('Update_Users'),
              },
              expressions: {
                hide: () =>
                  isAddOrUpdate ||
                  isViewList ||
                  !THIS._permissionService.hasPermission('Unlock_Users'),
              },
            },

            // 🔹 Active
            {
              type: 'radio',
              key: 'active',
              defaultValue: false,
              props: {
                label: THIS._languageService.getTransValue('common.activation'),
                options: [
                  {
                    label:
                      THIS._languageService.getTransValue('common.inactive'),
                    value: false,
                  },
                  {
                    label: THIS._languageService.getTransValue('common.active'),
                    value: true,
                  },
                ],
                onChange: (e: any) => THIS.toggleActiveUser(e.value),
                disabled:
                  !THIS._permissionService.hasPermission('Update_Users'),
              },
              expressions: {
                hide: () =>
                  isAddOrUpdate ||
                  isViewList ||
                  !THIS._permissionService.hasPermission('Deactivate_Users'),
              },
            },
          ],
        },
      ],
    },
    {
      fieldGroupClassName:
        'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 bg-white rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          className: 'col-span-1 sm:col-span-2 md:col-span-3',
          template: `<h5 class="mb-4 text-grey500 text-lg font-bold">
        ${THIS._languageService.getTransValue('users.personal')}
      </h5>`,
        },

        // 🔹 Telephone
        {
          type: 'phone',
          key: 'phone',
          props: {
            type: 'number',
            label: THIS._languageService.getTransValue('users.phone'),
            readonly: !isAddOrUpdate,
            placeholder: 'Enter telephone number',
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
          // validators: { validation: ['phone'] },
          // validation: {
          //   messages: { phone: () => 'Invalid telephone number' },
          // },
        },

        // 🔹 Mobile Number
        {
          type: 'phone',
          key: 'phoneNumber',
          props: {
            label: THIS._languageService.getTransValue('users.mobileNumber'),
            readonly: !isAddOrUpdate,
            // required: true,
            placeholder: 'Enter mobile number',
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
          // validators: { validation: ['phone'] },
          validation: {
            messages: {
              // required: () => 'Mobile number is required',
              // phone: () => 'Invalid mobile number',
            },
          },
        },

        // 🔹 Email
        {
          type: 'input',
          key: 'email',
          props: {
            label: THIS._languageService.getTransValue('common.email'),
            required: true,
            readonly: !isAddOrUpdate,
            placeholder: 'Enter email address',
          },
          validators: { validation: ['email'] },
          validation: {
            messages: {
              required: () => 'Email is required',
              email: () => 'Invalid email format',
            },
          },
        },

        // 🔹 Address
        {
          type: 'input',
          key: 'address1',
          className: 'col-span-1 sm:col-span-2 md:col-span-3',
          props: {
            label: THIS._languageService.getTransValue('users.address'),
            placeholder: 'Enter address',
          },
          expressions: { hide: () => !isAddOrUpdate },
        },

        // 🔹 Extension
        {
          type: 'input',
          key: 'extension',
          props: {
            label: THIS._languageService.getTransValue('users.ext'),
            placeholder: 'Enter extension',
          },
          expressions: { hide: () => !isAddOrUpdate },
        },
        // 🔹 Timesheet Date
        {
          type: 'date',
          key: 'timesheetDate',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('common.timesheet'),
            readonly: !isAddOrUpdate,
          },
        },

        // 🔹 Goal
        {
          type: 'input',
          key: 'goal',
          props: {
            type: 'number',
            max: 24,
            min: 1,
            label: THIS._languageService.getTransValue('users.goal'),
            readonly: !isAddOrUpdate,
            placeholder: 'Enter goal (1 - 24)',
          },
          validation: {
            messages: {
              min: () => 'Goal must be at least 1',
              max: () => 'Goal cannot exceed 24',
            },
          },
        },

        // 🔹 Branch
        {
          type: 'select',
          key: 'branchId',
          props: {
            label: THIS._languageService.getTransValue('common.branch'),

            optionsArr: getOptionsArray(
              THIS.lookupsData.branches.result,
              'id',
              nameKey,
            ),
            readonly: !isAddOrUpdate,
            required: true,
          },
          validation: {
            messages: { required: () => 'Branch selection is required' },
          },
        },
      ],
    },
  ];
}
