import { FormlyFieldConfig } from "@ngx-formly/core";
import { MatterClassUpdateComponent } from "./matter-class-update.component";

export function matterClassFieldsConfig(THIS: MatterClassUpdateComponent): FormlyFieldConfig[] {
    return [
        {
            fieldGroupClassName:'flex flex-col gap-4',
            fieldGroup:[
                {
                    key: 'classNo',
                    type: 'input',
                    props: {
                        label: THIS._languageService.getTransValue('matter.classNumber'),
                        disabled: true,
                    },
                },
                {
                    key: 'description',
                    type: 'textarea',
                    props: {
                        label: THIS._languageService.getTransValue('matter.description'),
                    },
                },
            ]
        }
        
    ]
}