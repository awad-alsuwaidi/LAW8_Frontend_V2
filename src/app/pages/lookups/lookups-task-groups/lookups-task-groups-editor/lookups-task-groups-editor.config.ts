import { FormlyFieldConfig } from '@ngx-formly/core';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { LookupsTaskGroupsEditorComponent } from './lookups-task-groups-editor.component';

export function lookupsPredefinedTasksEditorConfig(
  THIS: LookupsTaskGroupsEditorComponent,
): FormlyFieldConfig[] {
  const nameKey =
    THIS._languageService.getSelectedLanguage() === 'en' ? 'nameEn' : 'nameAr';

  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-3',
      fieldGroup: [
        {
          key: 'nameEn',
          type: 'textarea',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('lookups.taskgroupName'),
            rows: 1,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'nameAr',
          type: 'textarea',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue(
              'lookups.foreignTaskgroupName',
            ),
            rows: 1,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'departmentId',
          type: 'select',
          className: 'col-start-1 col-span-1',
          props: {
            label: THIS._languageService.getTransValue('lookups.department'),
            optionsArr: getOptionsArray(
              THIS.lookupsData?.department ?? [],
              'id',
              nameKey,
            ),
            selectedObj: {},
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'taskIds',
          type: 'multi-select',
          className: 'col-span-1',
          props: {
            label: THIS._languageService.getTransValue(
              'lookups.predefinedTasks',
            ),
            selectedObj: [],
            optionsArr: getOptionsArray(
              THIS.lookupsData?.predefinedTasks ?? [],
              'id',
              nameKey,
            ),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
      ],
    },
  ];
}
