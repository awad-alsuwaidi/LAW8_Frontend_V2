import { FormlyFieldConfig } from '@ngx-formly/core';
import { ReportActivity2FilterEditorComponent } from './report-activity-2-filter-editor.component';

export function reportActivity2FilterConfig(
  THIS: ReportActivity2FilterEditorComponent,
): FormlyFieldConfig[] {
  const currentLang =
    THIS._languageService.getSelectedLanguage() === 'en' ? 'en' : 'ar';

  return [
    {
      fieldGroupClassName: 'grid md:grid-cols-3 gap-6',
      fieldGroup: [
        {
          key: 'dateFrom',
          type: 'date',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('report.dateFrom'),
          },
        },
        {
          key: 'dateTo',
          type: 'date',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('report.dateTo'),
          },
        },
        {
          key: 'matterIds',
          type: 'multi-select',
          defaultValue: [],                          
          props: {
            virtualScroll: true,
            label: THIS._languageService.getTransValue('matters.title'),
            optionsArr: [],
            loading: true,
            multiple: true,
            emptyMessage: '',
          },
        },
        {
          key: 'activityTypeIds',
          type: 'multi-select',
          defaultValue: [],                          
          props: {
            label: THIS._languageService.getTransValue('matters.activityType'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          key: 'jurisdictionIds',
          type: 'multi-select',
          defaultValue: [],                        
          props: {
            label: THIS._languageService.getTransValue('matters.jurisdicion'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          key: 'matterStatusIds',
          type: 'multi-select',
          defaultValue: [],                         
          props: {
            label: THIS._languageService.getTransValue('matters.matterStatus'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          key: 'stageIds',
          type: 'multi-select',
          defaultValue: [],                          
          props: {
            label: THIS._languageService.getTransValue('matters.stage'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          key: 'matterTypeIds',
          type: 'multi-select',
          defaultValue: [],                           
          props: {
            label: THIS._languageService.getTransValue('matters.matterType'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          key: 'lawyerIds',
          type: 'multi-select',
          defaultValue: [],                          
          props: {
            label: THIS._languageService.getTransValue('report.lawyer'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          key: 'clientIds',
          type: 'multi-select',
          defaultValue: [],                         
          props: {
            label: THIS._languageService.getTransValue(
              THIS.isInhouse ? 'report.entity' : 'report.client',
            ),
            optionsArr: [],
            loading: true,
          },
        },
        {
          key: 'branchIds',
          type: 'multi-select',
          defaultValue: [],                           
          props: {
            label: THIS._languageService.getTransValue('common.branch'),
            optionsArr: [],
            loading: true,
          },
        },
        {
          key: 'lang',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('report.printLanguage'),
            optionsArr: [
              { label: THIS._languageService.getTransValue('report.english'), value: 'en' },
              { label: THIS._languageService.getTransValue('report.arabic'),  value: 'ar' },
            ],
          },
          defaultValue: currentLang,
          hooks: {
            onInit: (field) => {
              if (!field.formControl?.value) {
                field.formControl?.setValue(currentLang, { emitEvent: false });
              }
              field.formControl?.valueChanges.subscribe((value) => {
                if (!value) {
                  delete field.formControl?.parent?.value['lang'];
                }
              });
            },
          },
        },
      ],
      validators: {
        validation: [
          {
            name: 'dateRange',
            options: {
              startDate: 'dateFrom',
              endDate: 'dateTo',
              errorPath: 'dateTo',
            },
          },
        ],
      },
    },
    {
      fieldGroupClassName: 'grid grid-cols-1 py-2',
      fieldGroup: [
        {
          key: 'format',
          type: 'radio',
          defaultValue: 'pdf',
          props: {
            label: THIS._languageService.getTransValue('report.printType'),
            required: true,
            options: [
              { label: THIS._languageService.getTransValue('report.pdf'),   value: 'pdf'  },
              { label: THIS._languageService.getTransValue('report.excel'), value: 'xlsx' },
            ],
          },
        },
      ],
    },
  ];
}