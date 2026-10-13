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
            label: THIS._languageService.getTransValue('lookups.nickname'),
            required: true,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'accountName',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('lookups.accountName'),
            required: true,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'glAccountTypeId',           
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('lookups.type'),
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
            label: THIS._languageService.getTransValue('lookups.department'),
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
          key: 'categoryId',                
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('lookups.category'),
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
          key: 'costCenterId',               
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('lookups.costCenter'),
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
            label: THIS._languageService.getTransValue('lookups.control'),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'subAccountOfId',            
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('lookups.subAccountOf'),
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