import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { TmTaskEditorComponent } from './tm-task-editor.component';
import { FormlyFieldConfig } from '@ngx-formly/core';
export function matterTaskEditorFields(
  THIS: TmTaskEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-2 bg-white rounded-2xl',
      fieldGroup: [
        {
          key: 'description',
          type: 'textarea',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('matters.description'),
            //label: 'Description',
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'StartDate',
          type: 'date',
          props: {
            label: THIS._languageService.getTransValue('matters.startDate'),
            //label: 'Start Date',
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'DueDate',
          type: 'date',
          props: {
            label: THIS._languageService.getTransValue('matters.dueDate'),
            //label: 'Due Date',
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'assigneeList',
          type: 'multi-select',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('matters.assignee'),
            //label: 'Assignee',
            selectedObj: {},
            optionsArr: getOptionsArray(
              THIS.lookupsData.lawyers.result,
              'id',
              'name'
            ),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'Periority',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('matters.priority'),
            //label: THIS._languageService.getTransValue('common.priority'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.taskPriority.result,
              'id',
              'name'
            ),
            selectedObj: {},
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'status',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('matters.status'),
            //label: 'Status',
            optionsArr: getOptionsArray(
              THIS.lookupsData.taskStatus.result,
              'id',
              'name'
            ),
            selectedObj: {},
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'notes',
          type: 'textarea',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('matters.notes'),
            //label: 'Notes',
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'AttachmentList',
          type: 'attachment-list1111',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('matters.file'),
            //label: 'File',
            fileType: 'blob',
            multiple: true,
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
      ],
    },
  ];
}
