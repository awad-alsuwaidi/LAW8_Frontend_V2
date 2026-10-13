import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { BankAccountsEditorComponent } from './bank-accounts-editor.component';

export function bankAccountEditorFields(THIS: BankAccountsEditorComponent) {
  const lang = THIS._languageService.getSelectedLanguage();
  const nameKey = lang === 'en' ? 'nameEn' : 'nameAr';

  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-2 bg-white rounded-2xl',
      fieldGroup: [
        {
          key: 'bankName',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('lookups.bankName'),
            required: true,
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'bankAccountTypeId',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('lookups.bankTypeId'),
            optionsArr: getOptionsArray(
              THIS.lookupsData?.bankType ?? [],
              'id',
              nameKey,
            ),
            selectedObj: {},
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'accountName',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('lookups.accountName'),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'accountNo',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('lookups.accountNo'),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'address',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('lookups.address'),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'swiftCode',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('lookups.swiftCode'),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'iban',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('lookups.iban'),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'branchName',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('lookups.branchName'),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'accountHolder',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('lookups.accountHolder'),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'glAccountId',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('lookups.glAccountId'),
            optionsArr: getOptionsArray(
              THIS.lookupsData?.glAccount ?? [],
              'id',
              'accountName',
            ),
            selectedObj: {},
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
