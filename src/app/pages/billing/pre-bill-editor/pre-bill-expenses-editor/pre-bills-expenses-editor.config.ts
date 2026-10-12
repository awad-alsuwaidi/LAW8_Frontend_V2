// import { FormlyFieldConfig } from "@ngx-formly/core";
// import { PreBillExpensesEditorComponent } from "./pre-bill-expenses-editor.component";

// export function getPreBillExpensesFormlyField(THIS: PreBillExpensesEditorComponent): FormlyFieldConfig[] {
//     return [
//         {
//             fieldGroupClassName: 'grid gap-4 md:grid-cols-3',
//             fieldGroup: [
//                 {
//                     type: 'date',
//                     key: 'FromDate',
//                     defaultValue: new Date(),
//                     className: 'col-md-3',
//                     props: {
//                         label: 'Start Date',
//                     },
//                 },
//                 {
//                     type: 'date',
//                     key: 'ToDate',
//                     defaultValue: new Date(),
//                     className: 'col-md-3',
//                     props: {
//                         label: 'End Date',
//                     },
//                 },
//                 {
//                     type: 'select',
//                     key: 'NeverBill',
//                     className: 'col-md-3',
//                     props: {
//                         label: 'Never Bill Entries',
//                         options: ['Exclude', 'include', 'Write Off'].map((acc, index) => ({ label: acc, value: +index + 1 })),
//                     },
//                 },
//                 {
//                     type: 'checkbox',
//                     key: 'IncludeHold',
//                     className: 'col-md-3 d-flex align-items-center',
//                     props: {
//                         label: 'Include Held Changes',
//                     },
//                 },
//                 {
//                     key: 'expensesData',
//                 },
//                 {
//                     key: 'totalExpenses',
//                 },
//                 {
//                     type: 'button',
//                     className: 'col-span-2 flex justify-end ',
//                     props: {
//                         label: 'Load',
//                         class: 'text-primary border border-primary !px-8 !py-3 !w-[auto] h-10 !leading-3	!text-sm',
//                         onClick: () => THIS.loadData()
//                     },
//                 }
//             ],
//             validators: {
//                 validation: [
//                     {
//                         name: 'dateRange',
//                         options: { startDate: 'FromDate', endDate: 'ToDate', errorPath: 'ToDate' }
//                     }
//                 ]
//             },
//         },
//     ]
// }
import { FormlyFieldConfig } from "@ngx-formly/core";
import { PreBillExpensesEditorComponent } from "./pre-bill-expenses-editor.component";

export function getPreBillExpensesFormlyField(THIS: PreBillExpensesEditorComponent): FormlyFieldConfig[] {
    return [
        {
            fieldGroupClassName: 'grid gap-4 md:grid-cols-3',
            fieldGroup: [
                {
                    type: 'date',
                    key: 'ExpFromDate',
                    defaultValue: new Date(),
                    className: 'col-md-3',
                    props: {
                        label: 'Start Date',
                    },
                },
                {
                    type: 'date',
                    key: 'ExpToDate',
                    defaultValue: new Date(),
                    className: 'col-md-3',
                    props: {
                        label: 'End Date',
                    },
                },
                {
                    type: 'select',
                    key: 'NeverBillExpenses',
                    className: 'col-md-3',
                    props: {
                        label: 'Never Bill Entries',
                        optionsArr: ['Exclude', 'include', 'Write Off'].map((acc, index) => ({ label: acc, value: +index + 1 })),
                    },
                      defaultValue: 1, 

                },
                {
                    type: 'checkbox',
                    key: 'IncludeHoldExpenses',
                    className: 'col-md-3 d-flex align-items-center',
                    props: {
                        label: 'Include Held Charges',
                    },
                },
                {
                    key: 'expensesData',
                },
                {
                    key: 'totalExpenses',
                },
                {
                    type: 'button',
                    className: 'col-span-2 flex justify-end ',
                    props: {
                        label: 'Load',
                        class: 'text-primary border border-primary !px-8 !py-3 !w-[auto] h-10 !leading-3	!text-sm',
                        onClick: () => THIS.loadEverything()
                    },
                }
            ],
            validators: {
                validation: [
                    {
                        name: 'dateRange',
                        options: { startDate: 'FromDate', endDate: 'ToDate', errorPath: 'ToDate' }
                    }
                ]
            },
        },
    ]
}