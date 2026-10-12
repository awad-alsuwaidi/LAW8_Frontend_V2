import { FormlyFieldConfig } from "@ngx-formly/core";
import { SettingsGeneralComponent } from "./settings-general.component";

export function settingsGeneralFormlyConfig(THIS: SettingsGeneralComponent): FormlyFieldConfig[] {
    return [
        {
            fieldGroupClassName: 'grid md:grid-cols-3 gap-4',
            fieldGroup: [
                {
                    type: 'switch',
                    key: 'isSapIntegration',
                    defaultValue: true,
                   className: 'col-span-3',
                    props: {
                        label: THIS._languageService.getTransValue('SAP Accounting information'),
                    },

                },
                {
                    className: 'col-span-2',
                    fieldGroupClassName: 'grid md:grid-cols-2 gap-4',
                    fieldGroup: [
                        {
                            type: 'input',

                            key: 'sapUrl',
                            props: {
                                label: THIS._languageService.getTransValue('setting.serverName'),
                            },

                        },
                        {
                            type: 'input',

                            key: 'sapDatabase',
                            props: {
                                label: THIS._languageService.getTransValue(
                                    'setting.databaseName'
                                ),
                            },
                            expressions: {
                                'props.disabled': '!model.isSapIntegration',
                            },
                        },
                    ],
                    expressions: {
                        'hide': '!model.isSapIntegration',
                    },
                },
                {
                    className: 'col-span-2',
                    fieldGroupClassName: 'grid md:grid-cols-2 gap-4',
                    fieldGroup: [
                        {
                            type: 'input',

                            key: 'userName',
                            props: {
                                label: THIS._languageService.getTransValue('common.username'),
                            },
                        },
                        {
                            type: 'input',

                            key: 'password',
                            props: {
                                type: 'password',
                                label: THIS._languageService.getTransValue('common.password'),
                            },
                        },
                    ],
                    expressions: {
                        'hide': '!model.isSapIntegration',
                    },
                }


            ]
        },
        // {
        //     fieldGroupClassName: 'grid md:grid-cols-3 gap-4 bg-white p-6 rounded-lg mb-4',
        //     fieldGroup: [

        //         {
        //             type: 'switch',
        //             key: 'isTaxes',
        //             defaultValue: true,
        //            className: 'col-span-3',
        //             props: {
        //                 label: THIS._languageService.getTransValue('Taxes'),
        //             },

        //         },
        //         {
        //             className: 'col-span-2',
        //             fieldGroupClassName: 'grid md:grid-cols-2 gap-4',
        //             fieldGroup: [
        //                 {
        //                     type: 'input',

        //                     key: 'fees',
        //                     defaultValue: '0',
        //                     props: {
        //                         label: THIS._languageService.getTransValue('setting.fees'),
        //                         pKeyFilter: 'int'
        //                     },
        //                 },
        //                 {
        //                     type: 'input',

        //                     key: 'disbursements',
        //                     defaultValue: '0',
        //                     props: {
        //                         label: THIS._languageService.getTransValue('setting.disbursements'),
        //                         pKeyFilter: 'int'
        //                     },
        //                 },
        //             ],
        //             expressions: {
        //                 'hide': '!model.isTaxes',
        //             },
        //         },
               


        //     ]
        // },

    ]
}