import { FormlyFieldConfig } from "@ngx-formly/core"
import { SharedSearchComponent } from "./shared-search.component"

export function sharedSearchWithBtnFormlyConfig(THIS: SharedSearchComponent): FormlyFieldConfig[] {
    return [
        {
            fieldGroupClassName: 'flex',
            fieldGroup: [
                {
                    type: 'input',
                    key: 'search',
                    className: 'relative text-grey400 border-grey200 rounded-s-lg withbtn',
                    props: {
                        placeholder: 'topBar.search',
                        icon: 'icon-search',
                        withClear: true,
                        attributes: {
                            autocomplete: 'off'
                        },
                    },
                },
                {
                    type: 'button',
                    props: {
                        icon: 'icon-search !text-lg',
                        class:'!px-3 bg-primary text-white !py-1 rounded-s-none',
                        onClick: () => {
                            THIS.searchValueChange.emit(THIS.formly?.get('search')?.value);
                        }
                    }
                }
            ]
        }

    ]
}