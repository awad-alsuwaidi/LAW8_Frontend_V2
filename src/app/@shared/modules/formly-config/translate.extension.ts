import { FormlyExtension, FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';

export class TranslateExtension implements FormlyExtension {
    constructor(private translate: TranslateService) { }
    prePopulate(field: FormlyFieldConfig) {
        const props = field.props || {};

        if (props.label) {
            field.expressions = {
                ...(field.expressions || {}),
                'props.label': this.translate.stream(props.label),
            };
        }

        if (props.placeholder) {
            field.expressions = {
                ...(field.expressions || {}),
                'props.placeholder': this.translate.stream(props.placeholder),
            };
        }
    }
}

export function registerTranslateExtension(translate: TranslateService) {
    return {
        extensions: [
            {
                name: 'translate',
                extension: new TranslateExtension(translate),
            },
        ],
    };
}
