import { FormlyFieldConfig } from '@ngx-formly/core';
import { LookupsSubCategoryEditorComponent } from './lookups-sub-category-editor.component';

export function lookupsSubCategoryEditorConfig(
  THIS: LookupsSubCategoryEditorComponent,
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-2',
      fieldGroup: [
        {
          key: 'nameEn',
          type: 'input',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('lookups.nameEN'),
            required: THIS._languageService.getSelectedLanguage() === 'en',
          },
          validators: {
            validation: ['englishLetters'],
          },
        },
        {
          key: 'nameAr',
          type: 'input',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('lookups.nameAR'),
            required: THIS._languageService.getSelectedLanguage() === 'ar',
          },
          validators: {
            validation: ['arabicLetters'],
          },
        },
        {
          key: 'appealPeriod',
          type: 'input',
          className: 'col-span-1',
          props: {
            type: 'number',
            label: THIS._languageService.getTransValue('lookups.appealPeriod'),
            min: 0,
          },
        },
        {
          key: 'cassationPeriod',
          type: 'input',
          className: 'col-span-1',
          props: {
            type: 'number',
            label: THIS._languageService.getTransValue(
              'lookups.cassationPeriod',
            ),
            min: 0,
          },
        },
        {
          key: 'active',
          type: 'switch',
          defaultValue: true,
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('lookups.active'),
          },
        },
      ],
    },
  ];
}
