import { FormlyFieldConfig } from "@ngx-formly/core";
import { LookupsSubRateTableEditorComponent } from "./lookups-sub-rate-table-editor.component";

export function lookupsSubRateEditorConfig(THIS:LookupsSubRateTableEditorComponent): FormlyFieldConfig[] {
    return [
        {
            fieldGroupClassName: 'grid gap-4 md:grid-cols-2',
            fieldGroup:[
                {
                    key: 'name',
                    type: 'input',
                    className: 'col-span-2',
                    props: {
                      label: THIS._languageService.getTransValue('lookups.rateName'),
                      required: true
                    },
                  },
                  {
                    key: 'amount',
                    type: 'input',
                    className: 'col-span-2',
                    props: {
                      label: THIS._languageService.getTransValue('lookups.amount'),
                      required: true
                    },
                  },

                  {
                    key: 'isActive',
                    type: 'switch',
                    defaultValue: true,
                    props: {
                      label: THIS._languageService.getTransValue('lookups.active'),
                      class: 'd-block',
                    },
                  },
            ]
        }
    ]
}