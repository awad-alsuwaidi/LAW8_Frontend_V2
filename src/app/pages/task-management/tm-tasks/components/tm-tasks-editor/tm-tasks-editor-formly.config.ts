import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { TmTasksEditorComponent } from './tm-tasks-editor.component';
export function matterTaskEditorFields(THIS: TmTasksEditorComponent) {
  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-2 bg-white rounded-2xl',
      fieldGroup: [
        {
          type: 'select',
          key: 'matterId',
          props: {
            label: THIS._languageService.getTransValue('common.matterCode'),
            selectedObj: {},
            required: true,
            optionsArr: getOptionsArray(
              THIS.lookupsData.matterCode.result,
              'id',
              'name'
            ),
            virtualScroll: true,
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        // {
        //     key: 'description',
        //     type: 'textarea',
        //     className: 'col-span-2',
        //     props: {
        //         require: true,
        //         label: THIS._languageService.getTransValue('matters.description'),
        //         //label: 'Description',
        //     },
        //     expressions: {
        //         'props.readonly': 'formState.readonly',
        //     },
        // },
        {
          key: 'description',
          type: 'textarea',
          className: 'col-span-2',

          props: {
            required: true,
            label: THIS._languageService.getTransValue('matters.description'),
            //label: 'Description',
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        // {
        //     key: 'StartDate',
        //     type: 'date',
        //     require: true,

        //     props: {
        //         label: THIS._languageService.getTransValue('matters.startDate'),
        //         //label: 'Start Date',
        //         require: true,

        //     },
        //     expressions: {
        //         'props.readonly': 'formState.readonly',
        //     },

        // },
        {
          key: 'StartDate',
          type: 'date',
          defaultValue: new Date(),

          props: {
            label: THIS._languageService.getTransValue('matters.startDate'),
            //label: 'Start Date',
            required: true,
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'DueDate',
          type: 'date',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('matters.dueDate'),
            //label: 'Due Date',
            required: true,
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
            required: true,
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
          defaultValue: 4,
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
          defaultValue: 1,
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
          key: 'note',
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
          type: 'attachment-list',
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
