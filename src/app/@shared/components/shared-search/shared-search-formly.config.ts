import { FormlyFieldConfig } from "@ngx-formly/core"
import { SharedSearchComponent } from "./shared-search.component"

export function sharedSearchFormlyConfig(THIS:SharedSearchComponent):FormlyFieldConfig[] {
    return [
      {
        type: 'input',
        key: 'search',
        className: 'relative text-grey400 border-grey200',
        props: {
          placeholder: 'topBar.search',
          icon: 'icon-search',
          withClear: true,
          attributes: {
            autocomplete: 'off'
          },
          input: (e: any) => {
            THIS.searchValueChange.emit(e.target.value)
          },
        },


      },
    ]
}