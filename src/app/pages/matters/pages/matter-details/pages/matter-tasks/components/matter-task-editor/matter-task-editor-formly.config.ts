import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { MatterTaskEditorComponent } from './matter-task-editor.component';
export function matterTaskEditorFields(THIS: MatterTaskEditorComponent) {
  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-2 bg-white rounded-2xl',
      fieldGroup: [
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
          key: 'StartDate',
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
          key: 'DueDate',
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
          key: 'assigneeList',
          type: 'multi-select',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue('matters.assignee'),
            selectedObj: {},
            optionsArr: getOptionsArray(
              THIS.lookupsData.lawyers.result,
              'id',
              'name',
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
            optionsArr: getOptionsArray(
              THIS.lookupsData.taskPriority.result,
              'id',
              'name',
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
            optionsArr: getOptionsArray(
              THIS.lookupsData.taskStatus.result,
              'id',
              'name',
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
              startDate: 'StartDate',
              endDate: 'DueDate',
              errorPath: 'DueDate',
            },
          },
        ],
      },
    },
  ];
}
