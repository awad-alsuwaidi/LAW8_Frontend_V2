import { FormlyFieldConfig } from '@ngx-formly/core';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { UserInfoEditorComponent } from './user-info-editor.component';

export function userDetailsEditorFields(
  THIS: UserInfoEditorComponent
): FormlyFieldConfig[] {
  const isEn = THIS._languageService.getSelectedLanguage() == 'en';
  const isAddOrUpdate = ['add', 'update'].some((word) =>
    THIS._router.url.includes(word)
  );
  const isAdd = ['add'].some((word) => THIS._router.url.includes(word));
  const isViewList = ['view-list'].some((word) =>
    THIS._router.url.includes(word)
  );

  return [
    // ========== Main Info Section ==========
    {
      fieldGroupClassName:
        'grid gap-6 md:grid-cols-2 xl:grid-cols-3 bg-white rounded-2xl shadow-sm my-6 p-6',
      fieldGroup: [
        {
          className: 'col-span-full',
          template: `<h5 class="mb-6 text-xl font-bold border-b pb-2">
            ${THIS._languageService.getTransValue('matters.mainInfo')}
          </h5>`,
        },
        {
          key: isEn ? 'nameEn' : 'nameAr',
          type: 'input',
          props: {
            label: isEn
              ? THIS._languageService.getTransValue('lookups.nameEN')
              : THIS._languageService.getTransValue('lookups.nameAR'),
            required: isEn && isAddOrUpdate,
            readonly: !isAddOrUpdate,
            placeholder: isEn ? 'Enter English name' : 'ادخل الاسم بالعربية',
          },
          validators: {
            validation: ['englishLetters'],
          },
        },
        {
          key: !isEn ? 'nameEn' : 'nameAr',
          type: 'input',
          props: {
            label: !isEn
              ? THIS._languageService.getTransValue('lookups.nameEN')
              : THIS._languageService.getTransValue('lookups.nameAR'),
            required: !isEn && isAddOrUpdate,
            readonly: !isAddOrUpdate,
            placeholder: !isEn ? 'Enter English name' : 'ادخل الاسم بالعربية',
          },
          validators: {
            validation: ['arabicLetters'],
          },
        },
        {
          type: 'input',
          key: 'userName',
          props: {
            label: THIS._languageService.getTransValue('common.username'),
            readonly: !isAddOrUpdate,
            required: true,
            placeholder: 'Enter username',
          },
        },
        {
          key: 'defaultRateApproved',
        },
        {
          type: 'select',
          key: 'titleId',
          props: {
            label: THIS._languageService.getTransValue('users.titleuser'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.rateType.result,
              'id',
              'name'
            ),
            readonly: !isAddOrUpdate,
            required: true,
            placeholder: 'Select title',
            onChange: (e: DropdownChangeEvent) => {
              THIS.toggleDefaultRateApprove(e);
            },
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
            onChange: (e: any) => {
              THIS.toggleLockedeUser(e.value);
            },
          },
          expressions: {
            hide: () => isAddOrUpdate || isViewList,
          },
        },
        {
          type: 'radio',
          key: 'active',
          defaultValue: false,
          props: {
            label: THIS._languageService.getTransValue('common.activation'),
            options: [
              {
                label: THIS._languageService.getTransValue('common.inactive'),
                value: false,
              },
              {
                label: THIS._languageService.getTransValue('common.active'),
                value: true,
              },
            ],
            onChange: (e: any) => {
              THIS.toggleActiveUser(e.value);
            },
          },
          expressions: {
            hide: () => isAddOrUpdate || isViewList,
          },
        },
      ],
    },

    // ========== Personal Info Section ==========
    {
      fieldGroupClassName:
        'grid gap-6 md:grid-cols-2 xl:grid-cols-3 bg-white rounded-2xl shadow-sm my-6 p-6',
      fieldGroup: [
        {
          className: 'col-span-full',
          template: `<h5 class="mb-6 text-xl font-bold border-b pb-2">
            ${THIS._languageService.getTransValue('users.personal')}
          </h5>`,
        },
        {
          type: 'input',
          key: 'telNo',
          props: {
            type: 'number',
            label: THIS._languageService.getTransValue('common.email'),
            readonly: !isAddOrUpdate,
            placeholder: 'Enter email',
          },
        },
        {
          type: 'phone',
          key: 'mobileNo',
          props: {
            label: THIS._languageService.getTransValue('users.mobileNumber'),
            readonly: !isAddOrUpdate,
            placeholder: 'Enter mobile number',
          },
        },
      ],
    },
  ];
}
