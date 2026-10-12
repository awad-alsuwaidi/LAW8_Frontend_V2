import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { GlbankAccountsEditorComponent } from './glbank-accounts-editor.component';

export function glAccountEditorFields(THIS: GlbankAccountsEditorComponent) {
  const nameKey =
    THIS._languageService.getSelectedLanguage() === 'en' ? 'nameEn' : 'nameAr';

  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-2 bg-white rounded-2xl',
      fieldGroup: [
        {
          key: 'nickName',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('Nickname'),
            required: true,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'accountName',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('Account Name'),
            required: true,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'glAccountTypeId',            // ★ اسم جديد
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('Type'),
            required: true,
            optionsArr: getOptionsArray(
              THIS.lookupsData?.glType ?? [],
              'id',
              nameKey
            ),
            selectedObj: {},
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'departmentId',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('Department'),
            optionsArr: getOptionsArray(
              THIS.lookupsData?.department ?? [],
              'id',
              nameKey
            ),
            selectedObj: {},
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'categoryId',                 // ★ جديد
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('Category'),
            optionsArr: getOptionsArray(
              THIS.lookupsData?.category ?? [],
              'id',
              nameKey
            ),
            selectedObj: {},
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'costCenterId',               // ★ جديد
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('Cost Center'),
            optionsArr: getOptionsArray(
              THIS.lookupsData?.costCenter ?? [],
              'id',
              nameKey
            ),
            selectedObj: {},
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'control',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('Control'),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'subAccountOfId',             // ★ جديد
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('Sub Account Of'),
            type: 'number',
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        // {
        //   key: 'isActive',
        //   type: 'switch',
        //   defaultValue: true,
        //   className: 'col-span-2',
        //   props: {
        //     label: THIS._languageService.getTransValue('lookups.active'),
        //   },
        //   expressions: { 'props.readonly': 'formState.readonly' },
        // },
      ],
    },
  ];
}