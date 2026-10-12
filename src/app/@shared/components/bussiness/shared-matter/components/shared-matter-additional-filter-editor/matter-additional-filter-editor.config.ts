import { FormlyFieldConfig } from '@ngx-formly/core';
import { SharedMatterAdditionalFilterEditorComponent } from './shared-matter-additional-filter-editor.component';
import { API_Config } from 'src/app/@core/api/api-config/api.config';

export function matterAdditionalFilterFields(
  THIS: SharedMatterAdditionalFilterEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid md:grid-cols-2 gap-4',
      fieldGroup: [
        {
          type: 'select',
          key: 'clientId',
          hide: THIS._router.url.includes('client'),
          props: {
            virtualScroll: true,
            label: THIS._languageService.getTransValue(THIS.isInhouse ? 'common.entity' : 'common.client'),
            optionsArr: [],
          },
        },
        {
          type: 'select',
          key: 'practiceAreaId',
          props: {
            label: THIS._languageService.getTransValue('matters.practiceArea'),
            optionsArr: [],
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
            optionsArr: [],
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
            optionsArr: [],
            virtualScroll: true,
          },
        },
        {
          type: 'select',
          key: 'statusId',
          props: {
            label: THIS._languageService.getTransValue('matters.status'),
            optionsArr: [],
          },
        },
      ],
    },
  ];
}
