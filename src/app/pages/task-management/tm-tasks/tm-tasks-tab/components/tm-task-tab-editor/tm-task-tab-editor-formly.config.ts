import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { TmTaskTabEditorComponent } from './tm-task-tab-editor.component';
import { FormlyFieldConfig } from '@ngx-formly/core';

export function matterTaskEditorFields(
  THIS: TmTaskTabEditorComponent
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-2 bg-white rounded-2xl',
      fieldGroup: [
        {
          type: 'select',
          key: 'matterId',
          props: {
            label: THIS._languageService.getTransValue('common.matterCode'),
            required: true,
            optionsArr: getOptionsArray(THIS.lookupsData.matterCode.result, 'id', 'name'),
            searchable: true,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'title', 
          type: 'input',
          className: 'col-span-2',
          props: {
            required: true,
            label: THIS._languageService.getTransValue('matters.taskTitle'),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'description', 
          type: 'textarea',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('matters.notes'),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'startDate', 
          type: 'date',
          props: {
            label: THIS._languageService.getTransValue('matters.startDate'),
            required: true,
            showTime: false,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'dueDate', 
          type: 'date',
          props: {
            label: THIS._languageService.getTransValue('matters.dueDate'),
            required: true,
            showTime: false,
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'assignedUserIds', 
          type: 'multi-select',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('matters.assignee'),
            required: true,
            optionsArr: getOptionsArray(THIS.lookupsData.lawyers.result, 'userId', 'name'),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
          {
          key: 'priorityId', 
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('matters.priority'),
            selectedObj: {}, 
            optionsArr: getOptionsArray(THIS.lookupsData.taskPriority.result, 'id', 'name'),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'matterTaskStatusId', 
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('matters.status'),
            selectedObj: {}, 
            optionsArr: getOptionsArray(THIS.lookupsData.taskStatus.result, 'id', 'name'),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'attachments', 
          type: 'attachment-list',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('matters.file'),
            fileType: 'blob',
            multiple: true,
            downloadFn: (attachment: any) => {
              THIS.downloadTaskAttachment(attachment);
            },
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
      ],
      validators: {
        validation: [
          {
            name: 'dateRange',
            options: {
              startDate: 'startDate',
              endDate: 'dueDate',
              errorPath: 'dueDate',
            },
          },
        ],
      },
    },
  ];
}