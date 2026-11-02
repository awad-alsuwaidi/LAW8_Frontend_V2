import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { MatterTaskEditorComponent } from './matter-task-editor.component';

export function matterTaskEditorFields(THIS: MatterTaskEditorComponent) {
  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-2 bg-white rounded-2xl',
      fieldGroup: [
        {
          key: 'title',
          type: 'input',
          className: 'col-span-2',
          props: {
            required: true,
            label: THIS._languageService.getTransValue('matters.taskTitle'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'description',
          type: 'textarea',
          className: 'col-span-2',
          props: {
            required: true,
            label: THIS._languageService.getTransValue('matters.description'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'startDate',
          type: 'date',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('matters.startDate'),
            required: true,
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'dueDate',
          type: 'date',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('matters.dueDate'),
            required: true,
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'assignedUserIds',
          type: 'multi-select',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('matters.assignee'),
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
          key: 'priorityId',
          type: 'select',
          defaultValue: 4,
          props: {
            label: THIS._languageService.getTransValue('matters.priority'),
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
          key: 'matterTaskStatusId',
          type: 'select',
          defaultValue: 1,
          props: {
            label: THIS._languageService.getTransValue('matters.status'),
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
        // {
        //   key: 'percentComplete',
        //   type: 'input',
        //   props: {
        //     type: 'number',
        //     label: THIS._languageService.getTransValue('matters.percentComplete') || 'Percent Complete (%)',
        //     min: 0,
        //     max: 100,
        //   },
        //   expressions: {
        //     'props.readonly': 'formState.readonly',
        //   },
        // },
        // {
        //   key: 'isPrivate',
        //   type: 'switch',
        //   props: {
        //     label: THIS._languageService.getTransValue('matters.isPrivate'),
        //   },
        //   expressions: {
        //     'props.readonly': 'formState.readonly',
        //   },
        // },
        {
          key: 'note',
          type: 'textarea',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('matters.notes'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
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
          expressions: {
            'props.readonly': 'formState.readonly',
          },
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