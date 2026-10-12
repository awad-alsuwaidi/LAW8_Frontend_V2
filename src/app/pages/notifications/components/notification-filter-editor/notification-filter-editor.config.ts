import { FormlyFieldConfig } from "@ngx-formly/core";
import { getOptionsArray } from "src/app/@core/utilities/functions/get-options-arr";
import { NotificationFilterEditorComponent } from "./notification-filter-editor.component";
import { enumToArray } from "src/app/@core/utilities/functions/enum-to-array";
import { SystemModules } from "src/app/layout/components/topbar/app-notification/enums/system-modules";

export function notificationFilterEditor(THIS: NotificationFilterEditorComponent): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid grid-cols-1 md:grid-cols-2 gap-4', 
      fieldGroup: [
        // {
        //   type: 'radio',
        //   key: 'status',
        //   className: 'w-full',
        //   props: {
        //     label: THIS._languageService.getTransValue('Status'),
        //     options: [
        //       { label: THIS._languageService.getTransValue('Read'), value: false },
        //       { label: THIS._languageService.getTransValue('Unread'), value: true },
        //     ],
        //   },
        // },
    // {
        //   type: 'select',
        //   key: 'module',
        //   className: 'w-full',
        //   props: {
        //     label: THIS._languageService.getTransValue('Module'),
        //     optionsArr: enumToArray(SystemModules),
        //   },
        // },
{
  type: 'multi-select',
  key: 'module',
  className: 'w-full',
  props: {
    label: THIS._languageService.getTransValue('Type'),
    optionsArr: THIS.lookupsData.modulesOptions,
  },
},
        {
          type: 'date',
          key: 'dateFrom',
          className: 'w-full',
          props: {
            label: THIS._languageService.getTransValue('matters.dateFrom'),
          },
        },
        {
          type: 'date',
          key: 'dateTo',
          className: 'w-full',
          props: {
            label: THIS._languageService.getTransValue('matters.dateTo'),
          },
        },

{
  type: 'multi-select',
  key: 'ByUsers',
  className: 'w-full',
  props: {
    label: THIS._languageService.getTransValue('By'),
    optionsArr: getOptionsArray(THIS.lookupsData.user.result, 'id', 'name'),
    multiple: true,
  },
},
      ],
    },
    {
  type: 'radio',
  key: 'status',
  className: '',
  props: {
    label: THIS._languageService.getTransValue('Status'),
    options: [
      { label: THIS._languageService.getTransValue('All'), value: 'ALL' },
      { label: THIS._languageService.getTransValue('Read'), value: 'READ' },
      { label: THIS._languageService.getTransValue('Unread'), value: 'UNREAD' },
    ],
  },
},
    
  ];
}
