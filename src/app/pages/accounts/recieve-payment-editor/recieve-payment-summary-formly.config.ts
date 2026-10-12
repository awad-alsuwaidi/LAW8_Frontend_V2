import { FormlyFieldConfig } from "@ngx-formly/core";
import { RecievePaymentEditorComponent } from "./recieve-payment-editor.component";
import { AbstractControl } from "@angular/forms";

export function recievePaymentSummaryEditorFields(THIS: RecievePaymentEditorComponent): FormlyFieldConfig[] {
    return [
        {
            fieldGroupClassName: 'grid gap-4 md:grid-cols-3 bg-white rounded-2xl my-4 p-6',
            fieldGroup: [
                {
                    className: 'col-span-3',
                    template: `<h5 class="mb-4 text-grey500 text-lg font-bold"> ${THIS._languageService.getTransValue(
                        'Summary'
                    )}</h5>`,
                },
                {
                    key: 'transferToTrust',
                    type: 'input',
                    
                    props: {
                        label: "Transfer To Trust",
                        change: () => {
                            THIS.calcUnallocated()
                        }
                    },
                    validators: {
                        ip: {
                            expression: (c: AbstractControl) => !THIS.checkMoreThanUnallocated(c.value),
                            message: (error: any, field: FormlyFieldConfig) => `Should not be more than UnAllocated`,
                        },
                    },
                },
                {
                    key: 'sendRefundToClient',
                    type: 'input',
                    
                    props: {
                        label: "Send Refund To Client",
                        change: () => {
                            THIS.calcUnallocated()
                        }
                    },
                    validators: {
                        ip: {
                            expression: (c: AbstractControl) => !THIS.checkMoreThanUnallocated(c.value),
                            message: (error: any, field: FormlyFieldConfig) => `Should not be more than UnAllocated`,
                        },
                    },
                },
                {
                    key: 'totalAllocated',
                    type: 'input',
                    
                    props: {
                        label: "Total Allocated",
                        disabled: true
                    }
                },
                {
                    key: 'unAllocated',
                    type: 'input',
                    props: {
                        class: 'text-danger',
                        label: "UnAllocated",
                        disabled: true
                    }
                }
            ]
        }
    ]
}