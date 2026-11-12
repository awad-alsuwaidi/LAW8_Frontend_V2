import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { TmTasksEditorComponent } from './tm-tasks-editor.component';

export function matterTaskEditorFields(THIS: TmTasksEditorComponent) {
  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-2 bg-white rounded-2xl',
      fieldGroup: [
        {
          key: 'matterId',
          type: 'select',
          props: {
            required: true,
            label: THIS._languageService.getTransValue('common.matterCode'),
            optionsArr: getOptionsArray(
              THIS.lookupsData?.matters?.result || [],
              'id',
              'name',
            ),
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
            // ⭐ بياخد من userId والـ name اللي عملناه
            optionsArr: getOptionsArray(
              THIS.lookupsData?.users?.result || [],
              'userId',
              'name',
            ),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'priorityId',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('matters.priority'),
            optionsArr: getOptionsArray(
              THIS.lookupsData?.taskPriority?.result || [],
              'id',
              'name',
            ),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
        {
          key: 'matterTaskStatusId',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('matters.status'),
            optionsArr: getOptionsArray(
              THIS.lookupsData?.taskStatus?.result || [],
              'id',
              'name',
            ),
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
            downloadFn: (attachment: any) =>
              THIS.downloadTaskAttachment(attachment),
          },
          expressions: { 'props.readonly': 'formState.readonly' },
        },
      ],
    },
  ];
}
