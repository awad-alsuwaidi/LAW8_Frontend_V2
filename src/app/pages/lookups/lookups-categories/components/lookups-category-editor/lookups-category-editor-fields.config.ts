import { FormlyFieldConfig } from "@ngx-formly/core";
import { LookupsCategoryEditorComponent } from "./lookups-category-editor.component";
import { getOptionsArray } from "src/app/@core/utilities/functions/get-options-arr";

export function lookupsCategoryEditorConfig(THIS: LookupsCategoryEditorComponent): FormlyFieldConfig[] {
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
                    type: 'select',
                    key: 'practsAreaId',
                    className: 'col-span-2',

                    props: {
                        label: THIS._languageService.getTransValue('common.practiceArea'),
                        optionsArr: getOptionsArray(THIS.lookupsData.result, 'id', 'name'),
                    },
                },
                {
                    key: 'active',
                    type: 'switch',
                    defaultValue: true,
                    props: {
                        label: THIS._languageService.getTransValue('lookups.active'),
                    },
                },
            ]
        }
    ]
}