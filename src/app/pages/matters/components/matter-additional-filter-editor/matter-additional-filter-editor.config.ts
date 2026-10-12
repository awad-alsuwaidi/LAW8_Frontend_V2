import { FormlyFieldConfig } from '@ngx-formly/core';
import { MatterAdditionalFilterEditorComponent } from './matter-additional-filter-editor.component';
import { API_Config } from 'src/app/@core/api/api-config/api.config';

export function matterAdditionalFilterFields(
  THIS: MatterAdditionalFilterEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid md:grid-cols-2 gap-4',
      fieldGroup: [
        {
          type: 'select',
          key: 'clientId',
          props: {
            virtualScroll: true,
            label: THIS._languageService.getTransValue('matters.client'),
            optionsArr: THIS.lookupsData.clients.result.map((obj: any) => ({
              label: obj.name,
              value: obj,
            })),
          },
        },
        {
          type: 'select',
          key: 'practiceAreaId',
          props: {
            label: THIS._languageService.getTransValue('matters.practiceArea'),
            optionsArr: THIS.lookupsData.practiceArea.result.map(
              (obj: any) => ({ label: obj.name, value: obj })
            ),
            virtualScroll: true,
            onChange: (e: any) => {
              THIS.getMatterCategoryByPracticeAreaOptions(e?.value?.id);
            },
 
          },
        },
        {
          type: 'select',
          key: 'categoryId',
          props: {
            label: THIS._languageService.getTransValue('matters.category'),
            virtualScroll: true,
            onChange: (e: any) => {
              THIS.getMatterTypeByMatterCategoryOptions(e?.value?.id);
            },
         
          },
        },
        {
          type: 'select',
          key: 'matterTypeId',
          props: {
            label: THIS._languageService.getTransValue('matters.matterType'),
            virtualScroll: true,
          },
        },
        {
          type: 'select',
          key: 'statusId',
          props: {
            label: THIS._languageService.getTransValue('matters.status'),
            optionsArr: THIS.lookupsData.status.result.map((obj: any) => ({
              label: obj.name,
              value: obj,
            })),
          },
        },
      ],
    },
  ];
}
