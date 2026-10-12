import { FormlyFieldConfig } from '@ngx-formly/core';

import { LookupsSubMatterListEditorComponent } from './lookups-sub-matter-list-editor.component';

export function lookupsSubMatterListEditorConfig(
  THIS: LookupsSubMatterListEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-2',
      fieldGroup: [
        // {
        //   key: 'nameEn',
        //   type: 'input',
        //   className: 'col-span-2',
        //   props: {
        //     label: THIS._languageService.getTransValue('lookups.nameEN'),
        //     required: THIS._languageService.getSelectedLanguage() == 'en',
        //   },
        //   validators: {
        //     validation: ['englishLetters'],
        //   },
        // },
        {
  key: 'nameEn',
  type: 'input',
  className: 'col-span-2',
  props: {
    label: THIS.groupId === 13
      ? THIS._languageService.getTransValue('lookups.name')
      : THIS._languageService.getTransValue('lookups.nameEN'),
    required: true,
  },
  validators: THIS.groupId === 13 ? {} : {
    validation: ['englishLetters'],
  },
},
        {
          key: 'nameAr',
          type: 'input',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('lookups.nameAR'),
            required: THIS._languageService.getSelectedLanguage() == 'ar',
          },
          validators: {
            validation: ['arabicLetters'],
          },
            hideExpression: () => THIS.groupId == 13,
        },
 {
  key: 'groupId',
  type: 'select',
  className: 'col-span-2',
  props: {
    label: THIS._languageService.getTransValue('lookups.groupName'),
    required: true,
    // ★ القيمة الابتدائية من الـ component (بتتحدث لما الـ options تجي)
    optionsArr: THIS.taskCodeGroups ?? [],
  },
  hideExpression: () => THIS.groupId !== 7,
},

  
     {
  key: 'initial',
  type: 'input',
  className: 'col-span-2',
  props: {
    label: THIS._languageService.getTransValue('lookups.initial'),
    required: true,
  },
  hideExpression: () => THIS.groupId !== 7,
},
 
//  {
//   key: 'description',
//   type: 'input',
//   className: 'col-span-2',
//   props: {
//     label: THIS._languageService.getTransValue('lookups.description'),
//     required: true,
//   },
//   hideExpression: () => THIS.groupId !== 13,
// },
        {
          fieldGroupClassName: 'grid grid-cols-2 gap-4 items-center',
          fieldGroup: [
           {
  key: 'active',
  type: 'switch',
  defaultValue: true,
  props: {
    label: THIS._languageService.getTransValue('lookups.active'),
  },
     hideExpression: () => THIS.groupId == 13,
},
 {
  key: 'isBillable',
  type: 'switch',
  props: {
    label: THIS._languageService.getTransValue('lookups.isBillable'),
    required: true,
  },
  hideExpression: () => THIS.groupId !== 7,
},
// {
//   key: 'isDefault',
//   type: 'switch',
//   props: {
//     label: THIS._languageService.getTransValue('lookups.default'),
//     required: true,
//   },
//   hideExpression: () => THIS.groupId !== 13,
// },
            {
              key: 'isLitigation',
              type: 'checkbox',
              defaultValue: false,
              className: 'mt-3', 
              props: {
                label: THIS._languageService.getTransValue(
                  'lookups.isLitigation'
                ),
              },
              hideExpression: () => !THIS.showIsLitigation,
            },
          ],
        },
      ],
    },
  ];
}
