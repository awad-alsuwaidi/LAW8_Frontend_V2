// import { FormlyFieldConfig } from "@ngx-formly/core";
// import { getOptionsArray } from "src/app/@core/utilities/functions/get-options-arr";
// import { TopbarTimesheetEditorComponent } from "./topbar-timesheet-editor.component";
// // tsTimmer
// // matterId
// // mtrNo
// // clientName
// // law_LawerId
// // law_TaskCodeId
// // hours
// // rate
// // amount
// // explanationExplanation
// // notes
// export function topbarTimesheetEditorFormlyConfig(THIS:TopbarTimesheetEditorComponent): FormlyFieldConfig[] {
//     return [
//         {
//             fieldGroupClassName: 'grid grid-cols-3 gap-6',
//             fieldGroup: [

//                 {
//                     type: 'textarea',
//                     key: 'explanationExplanation',
//                     className: 'col-span-3',
//                     props: {
//                         label: 'Task Description',
//                         required: true,
//                         rows: 4
//                     }
//                 },
//                 {
//                     type: 'input-mask',
//                     key: 'tsTimmer',
//                     props: {
//                         label: 'Timer',
//                         mask: '99:99:99',
//                         slotChar: 'HH:MM:SS',
//                     },
//                 },
//                 {
//                     type: 'select',
//                     key: 'matterId',
//                     className:'col-span-2',
//                     props: {
//                         label: 'Matter',
//                         required: true,
//                         optionsArr:getOptionsArray(THIS.lookupsData?.matters.result, 'id', 'name'),
//                     },
//                 },
//                 {
//                     type:'date',
//                     key: 'date',
//                     props:{
//                         label: 'Date',
//                     }

//                 },
//                 {
//                     type:'select',
//                     key: 'law_LawerId',
//                     props:{
//                         label: 'Lawyer',
//                         optionsArr:getOptionsArray(THIS.lookupsData?.lawyers.result, 'id', 'name'),
//                     }

//                 },
//                 {
//                     type:'input',
//                     key: 'clientName',
//                     props:{
//                         label: 'Client Name',
//                     }

//                 },
//                 {
//                     type:'select',
//                     key: 'law_TaskCodeId',
//                     props:{
//                         label: 'Type',
//                         optionsArr:getOptionsArray(THIS.lookupsData?.tasks.result, 'id', 'name'),
//                     }

//                 },
//                 {
//                     type:'input',
//                     key: 'rate',
//                     props:{
//                         label: 'Rate',
//                     }

//                 },
//                 {
//                     type:'input',
//                     key: 'amount',
//                     props:{
//                         label: 'Amount',
//                     }

//                 },
//                 {
//                     type: 'textarea',
//                     key: 'notes',
//                     className: 'col-span-3',
//                     props: {
//                         label: 'Notes',
//                     }
//                 }
//             ]
//         }

//     ]
// }

import { FormlyFieldConfig } from '@ngx-formly/core';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { TopbarTimesheetEditorComponent } from './topbar-timesheet-editor.component';

export function topbarTimesheetEditorFormlyConfig(
  THIS: TopbarTimesheetEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid grid-cols-3 gap-6',
      fieldGroup: [
               {
          type: 'select',
          key: 'matterId',
          className: 'col-span-2',
          props: {
            label: 'Matter',
            required: true,
            optionsArr: getOptionsArray(
              THIS.lookupsData?.matters.result,
              'id',
              'name'
            ),
            virtualScroll: true,
            onChange: (e: any) => THIS.getMatterData(e.value),
          },
        },

    {
          type: 'input',
          key: 'clientName',
          props: {
            label : THIS._languageService.getTransValue(THIS.isInhouse ? 'common.entityname' : 'common.clientName'),
            disabled: true,
          },
        },
   
     
        // {
        //     type: 'input-mask',
        //     key: 'tsTimmer',
        //     props: {
        //         label: 'Timer',
        //         mask: '99:99:99',
        //         slotChar: 'HH:MM:SS',
        //     },
        // },
 
        {
          type: 'date',
          key: 'tmDate',
          defaultValue: new Date(),
          props: {
            label: 'Date',
          },
        },  {
          type: 'select',
          key: 'law_LawerId',
          defaultValue: THIS._authService.getDecodedToken()['Id'],
          props: {
            label: 'Lawyer',
            optionsArr: getOptionsArray(
              THIS.lookupsData?.lawyers.result,
              'id',
              'name'
            ),
          },
        },
               {
          type: 'input',
          key: 'hours',
          props: {
            label: 'Hours',
            type: 'number',
            required: true,
            step: 0.1,
            min: 0,
            input: (e: any) => THIS.setAmountValue(),
          },
          hooks: {
            onInit: (field) => {
              setTimeout(() => {
                const el = document.getElementById(field.id!);
                const icon = el?.parentElement?.querySelector(
                  '.icon-close'
                ) as HTMLElement;
                if (icon) {
                  icon.style.width = '0';
                  icon.style.visibility = 'hidden';
                }
              });
            },
          },
        },
                {
          type: 'textarea',
          key: 'explanationExplanation',
          className: 'col-span-3',
          props: {
            label: 'Task Description',
            required: true,
            rows: 4,
          },
        },
          {
          type: 'select',
          key: 'law_TaskCodeId',
          props: {
            label: 'Type',
            optionsArr: getOptionsArray(
              THIS.lookupsData?.tasks.result,
              'id',
              'name'
            ),
          },
        },
      
        {
          type: 'input',
          key: 'rate',
           hideExpression: () =>
    !THIS._authService.hasPermission('View_Rate&Amount'),
          props: {
            label: 'Rate',
            type: 'number',
          },
          hooks: {
            onInit: (field) => {
              setTimeout(() => {
                const el = document.getElementById(field.id!);
                const icon = el?.parentElement?.querySelector(
                  '.icon-close'
                ) as HTMLElement;
                if (icon) {
                  icon.style.width = '0';
                  icon.style.visibility = 'hidden';
                }
              });
            },
          },
        },
        {
          type: 'input',
          key: 'amount',
           hideExpression: () =>
           !THIS._authService.hasPermission('View_Rate&Amount'),
          props: {
            label: 'Amount',
            type: 'number',
            disabled: true,
          },
          hooks: {
            onInit: (field) => {
              setTimeout(() => {
                const el = document.getElementById(field.id!);
                const icon = el?.parentElement?.querySelector(
                  '.icon-close'
                ) as HTMLElement;
                if (icon) {
                  icon.style.width = '0';
                  icon.style.visibility = 'hidden';
                }
              });
            },
          },
    expressionProperties: {
  'model.amount': (model: any) => {
    const taskCodeId = +model.law_TaskCodeId;

    if (taskCodeId === 2 || taskCodeId === 3) {
      return 0;
    }

    const rate = +model.rate || 0;
    const hours = +model.hours || 0;

    return rate * hours;
  },
},
        },

        {
          type: 'textarea',
          key: 'notes',
          className: 'col-span-3',
          props: {
            label: 'Notes',
          },
        },
      ],
    },
  ];
}
