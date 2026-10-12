import { FormlyFieldConfig } from '@ngx-formly/core';
import { TaskManagementActivityEditorComponent } from './task-management-activity-editor.component';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { MatterActivityType } from 'src/app/pages/matters/enums/matter-activityType';

export function taskManagementActivityEditorFields(
  THIS: TaskManagementActivityEditorComponent,
): FormlyFieldConfig[] {
  const createMainInfoSection = (): FormlyFieldConfig => ({
    fieldGroupClassName:
      'grid gap-4 md:grid-cols-2 bg-white rounded-2xl my-4 p-6',
    fieldGroup: [
      {
        className: 'col-span-2',
        template: `<h5 class="mb-4 text-grey500 text-lg font-bold">${THIS._languageService.getTransValue(
          'matters.mainInfo',
        )}</h5>`,
      },
      {
        key: 'startDate',
        defaultValue: new Date(),
      },

      // {
      //   className: 'col-span-2',
      //   type: 'link',
      //   key: 'mtrNo',
      //   props: {
      //     label: THIS._languageService.getTransValue(
      //       'common.gotomatterdetails'
      //     ),
      //     class: 'text-primary underline cursor-pointer font-bold text-sm mt-3',
      //     onClick: () => {
      //       const url = THIS._router.serializeUrl(
      //         THIS._router.createUrlTree([
      //           `/matters/${THIS.formlyModel.law_MatterId}`,
      //         ])
      //       );
      //       window.open('#' + url, '_blank');
      //     },
      //   },
      //   expressionProperties: {
      //     hide: '!formState.readonly',
      //   },
      // },
      {
        type: 'select',
        key: 'law_MatterId',
        props: {
          label: THIS._languageService.getTransValue('common.matterCode'),
          selectedObj: {},
          required: true,
          optionsArr: getOptionsArray(
            THIS.lookupsData.matterCode.result,
            'id',
            'name',
          ),
          virtualScroll: true,
        },
        expressions: {
          // 'props.readonly': 'formState.readonly',
          'props.readonly': () => THIS.isEditMode || THIS.formlyOptions.formState.readonly,

        },
      },
      {
        key: 'law_ActivityTypeId',
        type: 'select',
        defaultValue: THIS._router.url.includes('activity') ? undefined : 1,
        props: {
          label: THIS._languageService.getTransValue('matters.activityType'),
          selectedObj: {},
          required: THIS.mode != 'view',
          optionsArr: getOptionsArray(
            THIS.lookupsData.activityType.result,
            'id',
            'name',
          ),
          onChange: (e: any) => {
            THIS.formly
              ?.get('law_ActivityType')
              ?.setValue(e?.originalEvent.target.innerText);
          },
          disabled: THIS._router.url?.includes('hearing-session'),
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
      },
      { key: 'law_ActivityType' },

      // {
      //   className: 'col-span-2',
      //   type: 'link',
      //   key: 'mtrNo',
      //   props: {
      //     label: 'Matter No.',
      //     class: 'text-primary underline cursor-pointer font-bold text-sm mt-3',
      //     onClick: () => {
      //       const url = THIS._router.serializeUrl(
      //         THIS._router.createUrlTree([
      //           `/matters/${THIS.formlyModel.law_MatterId}`,
      //         ])
      //       );
      //       window.open('#' + url, '_blank');
      //     },
      //   },
      //   expressionProperties: {
      //     hide: '!formState.readonly',
      //   },
      // },
    ],
    validators: {
      validation: [
        {
          name: 'dateRange',
          options: {
            startDate: 'activityStartDate',
            endDate: 'endDate',
            errorPath: 'endDate',
          },
        },
      ],
    },
  });
  const createTaskSection = (): FormlyFieldConfig => ({
    fieldGroupClassName:
      'grid gap-4 md:grid-cols-2 bg-white rounded-2xl my-4 p-6',
    fieldGroup: [
      {
        className: 'col-span-2',
        expressionProperties: {
          template: (model) =>
            `<h5 class="mb-4 text-grey500 text-lg font-bold">${
              model.law_ActivityType || 'Task'
            }</h5>`,
        },
      },
      {
        className: 'col-span-2',
        key: 'description',
        type: 'textarea',
        props: {
          label: THIS._languageService.getTransValue('common.description'),
          required: true,
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
      },
      // Start Date
      {
        key: 'tastStartDate',
        type: 'date',
        defaultValue: new Date(),
        props: {
          label: THIS._languageService.getTransValue('matters.startDate'),
          required: true,
          showTime: true,
          onSelect: (e: any) => {
            THIS.formly?.get('startDate')?.setValue(e);
          },
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
      },
      // Due Date
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
      // Assigned (full width as shown in image)
      {
        key: 'assigneeList',
        type: 'multi-select',
        className: 'col-span-2',
        props: {
          label: THIS._languageService.getTransValue('matters.assignee'),
          selectedObj: {},
          optionsArr: getOptionsArray(
            THIS.lookupsData.assigneeLawyers.result,
            'id',
            'name',
          ),
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
      },
      // Priority
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
      // Status
      {
        key: 'law_ActivityStatusId',
        type: 'select',
        defaultValue: !THIS._dynamicDialogConfig?.data?.rowData ? 1 : '',
        props: {
          label: THIS._languageService.getTransValue('matters.status'),
          selectedObj: {},
          optionsArr: getOptionsArray(
            THIS.lookupsData.activityStatus.result,
            'id',
            'name',
          ),
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
      },
      // Notes/Remark (full width as shown in image)
      {
        className: 'col-span-2',
        key: 'remark',
        type: 'input',
        props: {
          label: THIS._languageService.getTransValue('matters.remark'),
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
      },
      // File attachment (full width as shown in image)
      {
        key: 'AttachmentList',
        type: 'attachment-list',
        className: 'col-span-2',
        props: {
          label: THIS._languageService.getTransValue('matters.file'),
          fileType: 'blob',
          multiple: true,
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
      },
      // Private switch
      {
        key: 'isPrivate',
        type: 'switch',
        defaultValue: false,
        props: {
          label: THIS._languageService.getTransValue('matters.isPrivate'),
          class: 'd-block',
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
      },
    ],
    expressions: {
      hide: (field: FormlyFieldConfig) => {
        return field.model?.law_ActivityTypeId !== 2;
      },
    },
  });

  // Helper function to create hearing session section (law_ActivityTypeId = 1)
  const createHearingSessionSection = (): FormlyFieldConfig => ({
    fieldGroupClassName:
      'grid gap-4 md:grid-cols-2 bg-white rounded-2xl my-4 p-6',
    fieldGroup: [
      {
        className: 'col-span-2',
        template: `<h5 class="mb-4 text-grey500 text-lg font-bold">${THIS._languageService.getTransValue(
          'matters.hearingSession',
        )}</h5>`,
      },
      {
        className: 'col-span-2',
        key: 'description',
        type: 'textarea',
        props: {
          label: THIS._languageService.getTransValue('matters.comments'),
          rows: 3,
          autosize: true,
          autosizeMinRows: 3,
          autosizeMaxRows: 8,
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
      },
      {
        className: 'col-span-2',
        key: 'decission',
        type: 'input',
        props: {
          label: THIS._languageService.getTransValue('matters.decision'),
        },
        expressions: {
          'props.readonly': 'formState.readonly',
          hide: () => !THIS._dynamicDialogConfig.data?.rowData,
        },
      },
      {
        className: 'col-span-2',
        key: 'report',
        type: 'input',
        props: {
          label: THIS._languageService.getTransValue('matters.report'),
        },
        expressions: {
          'props.readonly': 'formState.readonly',
          hide: () => !THIS._dynamicDialogConfig.data?.rowData,
        },
      },
      {
        className: 'col-span-2',
        key: 'remark',
        type: 'input',
        props: {
          label: THIS._languageService.getTransValue('matters.remark'),
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
      },
      {
        key: 'chamber',
        type: 'input',
        props: {
          label: THIS._languageService.getTransValue('matters.chamber'),
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
      },
      // {
      //   key: 'rollNumber',
      //   type: 'input',
      //   props: {
      //     label: THIS._languageService.getTransValue('matters.rollNumber'),
      //   },

      //   expressions: {
      //     'props.readonly': 'formState.readonly',
      //   },
      // },

      {
        key: 'rollNumber',
        type: 'input',
        props: {
          type: 'text',
          label: THIS._languageService.getTransValue('matters.rollNumber'),
          inputmode: 'numeric',
        },
        hooks: {
          onInit: (field) => {
            const control = field?.formControl;
            if (!control) return;

            control.valueChanges.subscribe((value: string) => {
              if (value && /[^0-9]/.test(value)) {
                const numericOnly = value.replace(/[^0-9]/g, '');
                control.setValue(numericOnly, { emitEvent: false });
              }
            });
          },
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
        validation: {
          messages: {
            required: () =>
              THIS._languageService.getTransValue('matters.required'),
          },
        },
      },
      {
        key: 'law_AdjournmentReasonsId',
        type: 'select',
        props: {
          label: THIS._languageService.getTransValue(
            'matters.adjournmentReason',
          ),
          // virtualScroll: true,
          selectedObj: {},
          optionsArr: getOptionsArray(
            THIS.lookupsData.adjournmentReasons.result,
            'id',
            'name',
          ),
          onChange: (field: FormlyFieldConfig) => {
            THIS.formly?.get('law_ActivityStatusId')?.setValue(4);
            THIS.formly?.get('isNewHearingSession')?.setValue(true);
          },
        },
        expressions: {
          'props.readonly': 'formState.readonly',
          hide: () => !THIS._dynamicDialogConfig.data?.rowData,
        },
      },
      {
        key: 'litigatorId',
        type: 'select',
        props: {
          label: THIS._languageService.getTransValue('matters.litigator'),
          selectedObj: {},
          optionsArr: getOptionsArray(
            THIS.lookupsData.laywer.result,
            'id',
            'name',
          ),
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
      },
      {
        key: 'startDate',
        type: 'date',
        defaultValue: (() => {
          const date = new Date();
          date.setHours(8, 0, 0, 0);
          return date;
        })(),
        props: {
          label: THIS._languageService.getTransValue('matters.date'),
          required: true,
          showTime: true,
          hourFormat: '24',
          // onSelect: (e: any) => {
          //   THIS.formly?.get('startDate')?.setValue(e);
          // },
          onSelect: (e: any) => {
            THIS.formly?.get('startDate')?.patchValue(e, { emitEvent: false });
          },
        },
        hooks: {
          onInit: (field) => {
            if (!field?.formControl) return;
            const control = field.formControl;
            const value = control.value || new Date();
            value.setHours(8, 0, 0, 0);
            control.setValue(value, { emitEvent: false });
          },
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
      },
      {
        key: 'law_ActivityStatusId',
        defaultValue: !THIS._dynamicDialogConfig?.data?.rowData ? 1 : '',
        type: 'select',
        props: {
          label: THIS._languageService.getTransValue('matters.status'),
          selectedObj: {},
          optionsArr: getOptionsArray(
            THIS.lookupsData.activityStatus.result,
            'id',
            'name',
          ),
        },
        expressions: {
          'props.readonly': 'formState.readonly',
          'props.required':
            '[1,4, 7].includes(field.model?.law_ActivityTypeId)',
        },
      },

      // last edit to add attachment

      {
        key: 'documentDate',
        type: 'input',
        defaultValue: new Date().toISOString().split('T')[0],
        props: {
          type: 'hidden',
        },
        hide: true,
      },
      {
        key: 'receivedDate',
        type: 'input',
        defaultValue: new Date().toISOString().split('T')[0],
        props: { type: 'hidden' },
        hide: true,
      },
      {
        key: 'documentDescription',
        type: 'input',
        props: { type: 'hidden' },
        hide: true,
      },
      {
        key: 'attachments',
        type: 'attachment-list',
        className: 'col-span-2',
        props: {
          fileType: 'blob',
          multiple: true,
          showSelectFromMatterBtn: true,
          showLabelInReadonly: true,
          onSelectFromMatterClick: () => THIS.openSelectMatterDocuments(),
          registerApi: (instance: any) => {
            THIS.hearingAttachmentsFieldInstance = instance;
          },
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
      },
    ],
    expressions: {
      hide: (field: FormlyFieldConfig) => {
        return (
          field.model?.law_ActivityTypeId !== 1 ||
          !field.model?.law_ActivityTypeId
        );
      },
    },
  });

  // Helper function to create other activities section (Notes, Meetings, etc.)
  const createOtherActivitiesSection = (): FormlyFieldConfig => ({
    fieldGroupClassName:
      'grid gap-4 md:grid-cols-2 bg-white rounded-2xl my-4 p-6',
    fieldGroup: [
      {
        className: 'col-span-2',
        expressionProperties: {
          template: (model) =>
            `<h5 class="mb-4 text-grey500 text-lg font-bold">${model.law_ActivityType}</h5>`,
        },
      },

      {
        key: 'activityStartDate',
        type: 'date',
        defaultValue: new Date(),
        props: {
          label: THIS._languageService.getTransValue('matters.date'),
          required: true,
          showTime: true,
          hourFormat: '24',
          onSelect: (e: any) => {
            THIS.formly?.get('startDate')?.setValue(e);
          },
        },
        hooks: {
          onInit: (field) => {
            if (!field?.formControl) return;

            const control = field.formControl;
            const rowData = THIS._dynamicDialogConfig?.data?.rowData;
            const isEditMode = !!rowData;

            if (isEditMode && rowData?.startDate) {
              const editDate = new Date(rowData.startDate);
              if (!isNaN(editDate.getTime())) {
                control.setValue(editDate, { emitEvent: false });
              }
            } else {
              control.setValue(new Date(), { emitEvent: false });
            }
          },
        },
        expressions: {
          'props.readonly': 'formState.readonly',
          hide: (field: FormlyFieldConfig) => {
            return ![3, 5, 6, 8, 4, 7].includes(
              field.model?.law_ActivityTypeId,
            );
          },
        },
      },
      {
        key: 'endDate',
        type: 'date',
        props: {
          label: THIS._languageService.getTransValue('matters.endDate'),
          showTime: true,
        },
        expressions: {
          'props.readonly': 'formState.readonly',
          hide: (field: FormlyFieldConfig) => {
            return ![4].includes(field.model?.law_ActivityTypeId);
          },
          'props.required': '[4].includes(field.model?.law_ActivityTypeId)',
        },
      },
      {
        key: 'location',
        type: 'input',
        props: {
          label: THIS._languageService.getTransValue('matters.location'),
        },
        expressions: {
          'props.readonly': 'formState.readonly',
          hide: (field: FormlyFieldConfig) => {
            return ![4].includes(field.model?.law_ActivityTypeId);
          },
        },
      },
      {
        key: 'law_ActivityStatusId',
        type: 'select',
        defaultValue: !THIS._dynamicDialogConfig?.data?.rowData ? 1 : '',
        props: {
          label: THIS._languageService.getTransValue('matters.status'),
          selectedObj: {},
          optionsArr: getOptionsArray(
            THIS.lookupsData.activityStatus.result,
            'id',
            'name',
          ),
          
        },
        expressions: {
          'props.readonly': 'formState.readonly',
          hide: (field: FormlyFieldConfig) => {
            return ![4, 5, 7].includes(field.model?.law_ActivityTypeId);
          },
          'props.required': '[4, 7].includes(field.model?.law_ActivityTypeId)',
        },
      },
      {
        className: 'col-span-2',
        key: 'description',
        type: 'input',
        props: {
          label: THIS._languageService.getTransValue('common.description'),
        },
        expressions: {
          'props.readonly': 'formState.readonly',
          hide: (field: FormlyFieldConfig) => {
            return ![3, 5, 6, 8, 4, 7].includes(
              field.model?.law_ActivityTypeId,
            );
          },
          'props.required':
            '[3, 5, 6, 8, 4, 7].includes(field.model?.law_ActivityTypeId)',
        },
      },
      {
        className: 'col-span-2',
        key: 'remark',
        type: 'input',
        props: {
          label: THIS._languageService.getTransValue('matters.remark'),
        },
        expressions: {
          'props.readonly': 'formState.readonly',
          hide: (field: FormlyFieldConfig) => {
            return [1].includes(field.model?.law_ActivityTypeId);
          },
        },
      },
      {
        key: 'isPrivate',
        type: 'switch',
        defaultValue: false,
        props: {
          label: THIS._languageService.getTransValue('matters.isPrivate'),
          class: 'd-block',
        },
        expressions: {
          'props.readonly': 'formState.readonly',
          hide: (field: FormlyFieldConfig) => {
            return ![3, 5, 6, 4, 7].includes(field.model?.law_ActivityTypeId);
          },
        },
      },
    ],
    expressions: {
      hide: (field: FormlyFieldConfig) => {
        return (
          [1, 2].includes(field.model?.law_ActivityTypeId) ||
          !field.model?.law_ActivityTypeId
        );
      },
    },
  });
  const createNewHearingSessionSection = (): FormlyFieldConfig => ({
    fieldGroupClassName:
      'grid gap-4 md:grid-cols-2 bg-white rounded-2xl my-4 p-6',
    fieldGroup: [
      {
        type: 'switch',
        key: 'isNewHearingSession',
        defaultValue: true,
        className: 'col-span-2',
        props: {
          label: THIS._languageService.getTransValue(
            'matters.newHearingSession',
          ),
        },
        expressions: {
          hide: () => {
            const isEdit = !!THIS._dynamicDialogConfig?.data?.rowData;
            if (!isEdit) return false;
            const activityStatus =
              THIS._dynamicDialogConfig?.data?.rowData?.law_ActivityStatusId;
            return activityStatus === MatterActivityType.Completed;
          },
        },
        hooks: {
          onInit: (field: any) => {
            if (
              field.formControl.value === null ||
              field.formControl.value === undefined
            ) {
              field.formControl.setValue(true);
            }
          },
        },
      },
      {
        fieldGroupClassName: 'grid gap-4 md:grid-cols-2',
        key: 'newSession',
        className: 'col-span-2',
        expressions: {
          hide: (field: FormlyFieldConfig) => {
            const isNewHearingSession = field.form?.get(
              'isNewHearingSession',
            )?.value;
            const activityStatus =
              field.model?.law_ActivityStatusId ||
              THIS._dynamicDialogConfig?.data?.rowData?.law_ActivityStatusId;
            return (
              !isNewHearingSession ||
              activityStatus === MatterActivityType.Completed
            );
          },
          onInit: (field: FormlyFieldConfig) => {
            const startDateControl = field?.formControl?.get(
              'newSessionStartDate',
            );
            if (startDateControl && !startDateControl.value) {
              startDateControl.setValue(new Date());
            }
          },
        },
        fieldGroup: [
          {
            className: 'col-span-2',
            key: 'description',
            type: 'textarea',
            props: {
              label: THIS._languageService.getTransValue('matters.comments'),
              rows: 3,
              autosize: true,
              autosizeMinRows: 3,
              autosizeMaxRows: 8,
            },
            expressions: {
              'props.readonly': 'formState.readonly',
            },
          },
          {
            className: 'col-span-2',
            key: 'remark',
            type: 'input',
            props: {
              label: THIS._languageService.getTransValue('matters.remark'),
            },
            expressions: {
              'props.readonly': 'formState.readonly',
            },
          },
          {
            key: 'chamber',
            type: 'input',
            props: {
              label: THIS._languageService.getTransValue('matters.chamber'),
            },
            expressions: {
              'props.readonly': 'formState.readonly',
            },
          },
          {
            key: 'rollNumber',
            type: 'input',
            props: {
              type: 'text',
              label: THIS._languageService.getTransValue('matters.rollNumber'),
              inputmode: 'numeric',
            },
            hooks: {
              onInit: (field) => {
                const control = field?.formControl;
                if (!control) return;

                control.valueChanges.subscribe((value: string) => {
                  if (value && /[^0-9]/.test(value)) {
                    const numericOnly = value.replace(/[^0-9]/g, '');
                    control.setValue(numericOnly, { emitEvent: false });
                  }
                });
              },
            },
            expressions: {
              'props.readonly': 'formState.readonly',
            },
            validation: {
              messages: {
                required: () =>
                  THIS._languageService.getTransValue('matters.required'),
              },
            },
          },
          {
            key: 'litigatorId',
            type: 'select',
            props: {
              label: THIS._languageService.getTransValue('matters.litigator'),
              selectedObj: {},
              optionsArr: getOptionsArray(
                THIS.lookupsData.laywer.result,
                'id',
                'name',
              ),
            },
            expressions: {
              'props.readonly': 'formState.readonly',
            },
          },
          //          {
          //   key: 'hearingStartDate',
          //   type: 'date',
          //   defaultValue: (() => {
          //     const d = new Date();
          //     d.setHours(8, 0, 0, 0);
          //     return d;
          //   })(),
          //   props: {
          //     label: THIS._languageService.getTransValue('matters.date'),
          //     required: true,
          //     showTime: true,
          //     hourFormat: '24',
          //     onSelect: (e: Date) => {
          //       THIS.formly?.get('startDate')?.setValue(e);
          //     },
          //   },
          //   hooks: {
          //     onInit: (field) => {
          //       if (!field?.formControl) return;

          //       const control = field.formControl;
          //       if (control.value) return;
          //       const d = new Date();
          //       d.setHours(8, 0, 0, 0);
          //       control.setValue(d, { emitEvent: false });
          //     },
          //   },
          //   expressions: {
          //     'props.readonly': 'formState.readonly',
          //   },
          // }
          // ,

{
  key: 'hearingStartDate',
  type: 'date',
  defaultValue: (() => {
    const date = new Date();
    date.setHours(8, 0, 0, 0);
    return date;
  })(),
  props: {
    label: THIS._languageService.getTransValue('matters.date'),
    required: true,
    showTime: true,
    hourFormat: '24',

    onSelect: (value: Date) => {
      if (!value) return;

      THIS.isNewSessionHearingTimeChanged =
        value.getHours() !== 8 || value.getMinutes() !== 0;

      THIS.formly
        ?.get('newSession.hearingStartDate')
        ?.setValue(value, { emitEvent: false });
    },
  },
  hooks: {
    onInit: (field) => {
      if (!field?.formControl) return;

      const control = field.formControl;

      if (!control.value) {
        const date = new Date();
        date.setHours(8, 0, 0, 0);

        control.setValue(date, { emitEvent: false });
      }

      THIS.isNewSessionHearingTimeChanged = false;
    },
  },
},
          // {
          //     key: 'startDate',
          //     type: 'date',
          //     defaultValue: new Date(),
          //     props: {
          //         label: THIS._languageService.getTransValue('matters.startDate'),
          //         required: true,
          //         showTime: true,
          //     },
          //     expressions: {
          //         'props.readonly': 'formState.readonly',
          //     },
          // },
          {
            key: 'law_ActivityStatusId',
            type: 'select',
            defaultValue: 1,
            props: {
              label: THIS._languageService.getTransValue('matters.status'),
              selectedObj: {},
              optionsArr: getOptionsArray(
                THIS.lookupsData.activityStatus.result,
                'id',
                'name',
              ),
            },
            expressions: {
              'props.readonly': 'formState.readonly',
            },
          },

// last edit to add attachment hereeeeeeeeee
      // {
      //   key: 'newdocumentDate',
      //   type: 'input',
      //   defaultValue: new Date(),
      //   props: {
      //     type: 'hidden',
      //   },
      //   hide: true,
      // },
      // {
      //   key: 'newreceivedDate',
      //   type: 'input',
      //   defaultValue: new Date(),
      //   props: { type: 'hidden' },
      //   hide: true,
      // },
      {
        key: 'newdocumentDescription',
        type: 'input',
        props: { type: 'hidden' },
        hide: true,
      },
      {
  key: 'newSessionAttachments',
  type: 'attachment-list',
  className: 'col-span-2',
  props: {
    fileType: 'blob',
    multiple: true,
    showSelectFromMatterBtn: true,
    onSelectFromMatterClick: () => THIS.openSelectMatterDocumentsForNewSession(),
    registerApi: (instance: any) => {
      THIS.newSessionAttachmentsFieldInstance = instance;
    },
  },
  expressions: {
    'props.readonly': 'formState.readonly',
  },
},
      

        ],
      },
    ],
    expressions: {
      hide: () => {
        return (
          !THIS.formly.get('law_AdjournmentReasonsId')?.value ||
          !!THIS._dynamicDialogConfig?.data?.rowData?.law_AdjournmentReasonsId
        );
      },
    },
  });

  // Helper function to create final judgement section
  const createFinalJudgementSection = (): FormlyFieldConfig => ({
    fieldGroupClassName:
      'grid gap-4 md:grid-cols-2 bg-white rounded-2xl my-4 p-6',
    className: 'col-span-2',
    fieldGroup: [
      {
        type: 'switch',
        key: 'finalJudgement',
        className: 'col-span-2',
        props: {
          label: THIS._languageService.getTransValue('matters.finalJudgement'),
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
      },
      {
        key: 'law_FinalJudgementId',
        type: 'select',
        props: {
          label: THIS._languageService.getTransValue('matters.finalJudgement'),
          selectedObj: {},
          optionsArr: getOptionsArray(
            THIS.lookupsData.finalJudement.result,
            'id',
            'name',
          ),
        },
        expressions: {
          'props.readonly': 'formState.readonly',
          hide: (field: FormlyFieldConfig) => !field.model?.finalJudgement,
        },
      },
      {
        key: 'cassation_Or_AppealPeriod',
        type: 'input',
        props: {
          label: THIS._languageService.getTransValue(
            'matters.cassationOrAppealPeriod',
          ),
          pKeyFilter: 'int',
        },
        expressions: {
          'props.readonly': 'formState.readonly',
          hide: (field: FormlyFieldConfig) => !field.model?.finalJudgement,
        },
      },
    ],
    expressions: {
      hide: (field: FormlyFieldConfig) => {
        return !(
          [1].includes(field.model?.law_ActivityTypeId) &&
          THIS._dynamicDialogConfig.data?.rowData
        );
      },
    },
  });

  const createMeetingAttendeesSection = (): FormlyFieldConfig => ({
    fieldGroupClassName:
      'grid gap-4 md:grid-cols-2 bg-white rounded-2xl my-4 p-6',
    fieldGroup: [
      {
        className: 'col-span-2',
        expressionProperties: {
          template: (model) =>
            `<h5 class="mb-4 text-grey500 text-lg font-bold">Attendees</h5>`,
        },
      },
      {
        key: 'users',
        type: 'multi-select',
        props: {
          label: THIS._languageService.getTransValue('Select Attendees'),
          selectedObj: {},
          optionsArr: getOptionsArray(
            THIS.lookupsData.users.result,
            'id',
            'name',
            'object',
          ),
        },
        expressions: {
          'props.readonly': 'formState.readonly',
        },
      },
    ],
    expressions: {
      hide: (field: FormlyFieldConfig) => {
        return (
          field.model?.law_ActivityTypeId !== 4 ||
          !field.model?.law_ActivityTypeId
        );
      },
    },
  });
  return [
    createMainInfoSection(),
    createTaskSection(),
    createHearingSessionSection(),
    createNewHearingSessionSection(),
    createFinalJudgementSection(),
    createOtherActivitiesSection(),
    createMeetingAttendeesSection(),
  ];
}
