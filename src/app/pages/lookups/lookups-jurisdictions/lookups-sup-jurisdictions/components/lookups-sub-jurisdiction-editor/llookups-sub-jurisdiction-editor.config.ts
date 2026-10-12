import { FormlyFieldConfig } from '@ngx-formly/core';
import { LookupsSubJurisdictionEditorComponent } from './lookups-sub-jurisdiction-editor.component';

export function lookupsSubJurisdictionEditorConfig(
  THIS: LookupsSubJurisdictionEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-2',
      fieldGroup: [
        // ★ حقل مخفي — يتبعت للباك لكن مش بيتعرض
        {
          key: 'jurisdictionId',
          type: 'input',
          className: '!hidden',
          defaultValue: THIS.jurisdictionIdentifier,
        },
        {
          key: 'nameEn',
          type: 'input',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('lookups.nameEN'),
            required: THIS._languageService.getSelectedLanguage() == 'en',
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
            required: THIS._languageService.getSelectedLanguage() == 'ar',
          },
          validators: {
            validation: ['arabicLetters'],
          },
        },
        {
          key: 'isActive',                       // ★ مش 'active'
          type: 'switch',
          defaultValue: true,
          props: {
            label: THIS._languageService.getTransValue('lookups.active'),
            class: 'd-block',
          },
        },
      ],
    },
  ];
}