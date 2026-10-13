import { FormlyFieldConfig } from '@ngx-formly/core';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { LookupsPredefinedTasksEditorComponent } from './lookups-predefined-tasks-editor.component';

export function lookupsPredefinedTasksEditorConfig(
  THIS: LookupsPredefinedTasksEditorComponent,
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-3',
      fieldGroup: [
        {
          key: 'nameEn',
          type: 'textarea',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue(
              'lookups.taskDesription',
            ),
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
              'lookups.foreignDescription',
            ),
            rows: 1,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },

        {
          key: 'priorityId',
          type: 'select',
          className: 'col-start-1 col-span-1',
          props: {
            label: THIS._languageService.getTransValue('common.priority'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.taskPriority,
              'id',
              'nameEn',
            ),
            selectedObj: {},
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'assigneeIds',
          type: 'multi-select',
          className: 'col-span-1',
          props: {
            label: THIS._languageService.getTransValue('lookups.assignee'),
            selectedObj: [],
            optionsArr: getOptionsArray(
              THIS.lookupsData?.users ?? [],
              'id',
              'name',
            ),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'durationType',
          type: 'radio',
          className: 'col-start-1 col-span-1',
          defaultValue: 1,
          props: {
            label: THIS._languageService.getTransValue('lookups.durationType'),
            options: [
              { label: 'Hours', value: 1 },
              { label: 'Days', value: 2 },
            ],
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'duration',
          type: 'input',
          className: 'col-span-1',
          props: {
            label: THIS._languageService.getTransValue('lookups.duration'),
            type: 'number',
            min: 0,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'attachments',
          type: 'attachment-list',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue(
              'lookups.attachDocument',
            ),
            fileType: 'blob',
            multiple: true,
            downloadFn: (attachment: any) =>
              THIS.downloadTaskAttachment(attachment),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
      ],
    },
  ];
}
