import { FormlyFieldConfig } from '@ngx-formly/core';
import { MatterActivityEditorComponent } from './matter-activity-editor.component';
import { MatterActivityType } from 'src/app/pages/matters/enums/matter-activityType';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';

export function matterActivityEditorFields(
  THIS: MatterActivityEditorComponent,
): FormlyFieldConfig[] {
  const createMeetingAttendeesSection = (): FormlyFieldConfig => ({
    fieldGroupClassName:
      'grid gap-4 md:grid-cols-2 bg-white rounded-2xl my-4 p-6',
    fieldGroup: [
      {
        className: 'col-span-2',
        template: `<h5 class="mb-4 text-grey500 text-lg font-bold">
        ${THIS._languageService.getTransValue('Select Attendees')}
      </h5>`,
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
      hide: (field: FormlyFieldConfig) => field.model?.law_ActivityTypeId !== 4,
    },
  });
  return [
    {
      fieldGroupClassName:
        'grid gap-4 md:grid-cols-2 bg-white rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          className: 'col-span-2',
          template: `<h5 class="mb-4 text-grey500 text-lg font-bold"> ${THIS._languageService.getTransValue(
            'matters.mainInfo',
          )}</h5>`,
        },
        {
          type: 'input',
          key: 'mtrNo',
          props: {
            label: THIS._languageService.getTransValue('common.matterCode'),
            readonly: true,
          },
        },

        {
          key: 'law_ActivityTypeId',
          type: 'select',
          defaultValue: 1,
          props: {
            label: THIS._languageService.getTransValue('matters.activityType'),
            required: true,
            optionsArr: THIS.lookupsData.activityType.result.map(
              (obj: any) => ({
                label: obj.name,
                value: obj.id,
              }),
            ),
            onChange: (e: any) => {
              console.log(e?.originalEvent.target.innerText);
              THIS.formly
                ?.get('law_ActivityType')
                ?.setValue(e?.originalEvent.target.innerText);

              THIS.syncStartDateValues();
            },
          },
          expressions: {
            'props.required':
              '[1,4, 7].includes(field.model?.law_ActivityTypeId)',
            'props.readonly': 'formState.readonly',
          },
        },
        { key: 'law_ActivityType' },
      ],
    },

    {
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
            hide: () => !THIS._dynamicDialogConfig.data.rowData,
            'props.readonly': 'formState.readonly',
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
            hide: () => !THIS._dynamicDialogConfig.data.rowData,
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
            hide: (field: FormlyFieldConfig) =>
              ![1].includes(field.model?.law_ActivityTypeId),
            'props.readonly': 'formState.readonly',
          },
        },

        {
          key: 'law_AdjournmentReasonsId',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue(
              'matters.adjournmentReason',
            ),
            virtualScroll: true,
            //required: true,
            optionsArr: THIS.lookupsData.adjournmentReasons.result.map(
              (obj: any) => ({
                label: obj.name,
                value: obj.id,
              }),
            ),
            // onChange: (field: FormlyFieldConfig) => {
            //     console.log('change');
            //     THIS.formly?.get('law_ActivityStatusId')?.setValue(4);
            // },
            onChange: (field: FormlyFieldConfig) => {
              THIS.formly?.get('law_ActivityStatusId')?.setValue(4);
              THIS.formly?.get('isNewHearingSession')?.setValue(true);
            },
          },
          expressions: {
            hide: () => !THIS._dynamicDialogConfig.data.rowData,
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
            optionsArr: THIS.lookupsData.laywer.result.map((obj: any) => ({
              label: obj.name,
              value: obj.id,
            })),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'startDate',
          type: 'date',
          props: {
            label: THIS._languageService.getTransValue('matters.date'),
            required: true,
            showTime: true,
            hourFormat: '24',
          },
          hooks: {
            onInit: (field) => {
              if (!field?.formControl) return;
              const control = field.formControl;
              const value = control.value
                ? new Date(control.value)
                : new Date();
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
            optionsArr: THIS.lookupsData.activityStatus.result.map(
              (obj: any) => ({
                label: obj.name,
                value: obj.id,
              }),
            ),
          },
          expressions: {
            'props.required':
              '[1,4, 7].includes(field.model?.law_ActivityTypeId)',
            'props.readonly': 'formState.readonly',
          },
        },

        {
          key: 'hearingDocumentDate',
          type: 'input',
          defaultValue: new Date(),
          props: {
            type: 'hidden',
          },
          hide: true,
        },
        {
          key: 'hearingReceivedDate',
          type: 'input',
          defaultValue: new Date(),
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
            field.model?.law_ActivityTypeId != 1 ||
            !field.model?.law_ActivityTypeId
          );
        },
      },
    },

    {
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
        // {
        //   type: 'switch',
        //   key: 'isNewHearingSession',
        //   defaultValue: true,
        //   className: 'col-span-2',
        //   props: {
        //     label: THIS._languageService.getTransValue(
        //       'matters.newHearingSession'
        //     ),
        //   },
        //   expressions: {
        //     hide: (field: FormlyFieldConfig) => {
        //       const activityStatus =
        //         field.model?.law_ActivityStatusId ||
        //         THIS._dynamicDialogConfig?.data?.rowData?.law_ActivityStatusId;
        //       return activityStatus === MatterActivityType.Completed;
        //     },
        //   },
        //   hooks: {
        //     onInit: (field: any) => {
        //       if (
        //         field.formControl.value === null ||
        //         field.formControl.value === undefined
        //       ) {
        //         field.formControl.setValue(true);
        //       }
        //     },
        //   },
        // },
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
                const date = new Date();
                date.setHours(8, 0, 0, 0);
                startDateControl.setValue(date, { emitEvent: false });
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
            },
            {
              className: 'col-span-2',
              key: 'remark',
              type: 'input',
              props: {
                label: THIS._languageService.getTransValue('matters.remark'),
              },
            },
            {
              key: 'chamber',
              type: 'input',
              props: {
                label: THIS._languageService.getTransValue('matters.chamber'),
              },
            },
            {
              key: 'rollNumber',
              type: 'input',
              props: {
                type: 'text',
                label:
                  THIS._languageService.getTransValue('matters.rollNumber'),
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
                optionsArr: THIS.lookupsData.laywer.result.map((obj: any) => ({
                  label: obj.name,
                  value: obj.id,
                })),
              },
            },
            // {
            //   key: 'newSessionStartDate',
            //   type: 'date',
            //   props: {
            //     label: THIS._languageService.getTransValue('matters.date'),
            //     required: true,
            //     showTime: true,
            //   },
            //   defaultValue: THIS._dynamicDialogConfig?.data?.rowData
            //     ? undefined
            //     : new Date(),
            // },
            {
              key: 'newSessionStartDate',
              type: 'date',
              props: {
                label: THIS._languageService.getTransValue('matters.date'),
                required: true,
                showTime: true,
                hourFormat: '24',
              },
              hooks: {
                onInit: (field) => {
                  const control = field?.formControl;
                  if (!control) return;
                  if (control.value) return;
                  const date = new Date();
                  date.setHours(8, 0, 0, 0);
                  control.setValue(date, { emitEvent: false });
                },
              },
            },
            // {
            //   key: 'law_ActivityStatusId',
            //   type: 'select',
            //   defaultValue: 1,
            //   props: {
            //     label: THIS._languageService.getTransValue('matters.status000000'),
            //     optionsArr: THIS.lookupsData.activityStatus.result.map(
            //       (obj: any) => ({
            //         label: obj.name,
            //         value: obj.id,
            //       })
            //     ),
            //   },
            // },

            {
              key: 'law_ActivityStatusId',
              type: 'select',
              props: {
                label: THIS._languageService.getTransValue('matters.status'),
                optionsArr: THIS.lookupsData.activityStatus.result.map(
                  (obj: any) => ({
                    label: obj.name,
                    value: obj.id,
                  }),
                ),
              },
              hooks: {
                onInit: (field) => {
                  const control = field?.formControl;
                  const options = field?.props?.['optionsArr'];
                  if (control && options?.length && !control.value) {
                    control.setValue(options[0].value);
                  }
                },
              },
              expressions: {
                'props.readonly': 'formState.readonly',
              },
            },
            {
              key: 'newSessionAttachments',
              type: 'attachment-list',
              className: 'col-span-2',
              props: {
                fileType: 'blob',
                multiple: true,
                showSelectFromMatterBtn: true,
                onSelectFromMatterClick: () =>
                  THIS.openSelectMatterDocumentsForNewSession(),
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
    },

    {
      fieldGroupClassName:
        'grid gap-4 md:grid-cols-2 bg-white rounded-2xl my-4 p-6',
      className: 'col-span-2',
      fieldGroup: [
        {
          type: 'switch',
          key: 'finalJudgement',
          className: 'col-span-2',
          props: {
            label: THIS._languageService.getTransValue(
              'matters.finalJudgement',
            ),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'law_FinalJudgementId',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue(
              'matters.finalJudgement',
            ),
            optionsArr: THIS.lookupsData.finalJudement.result.map(
              (obj: any) => ({
                label: obj.name,
                value: obj.id,
              }),
            ),
          },
          expressions: {
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
            hide: (field: FormlyFieldConfig) => !field.model?.finalJudgement,
          },
        },
      ],
      expressions: {
        hide: (field: FormlyFieldConfig) => {
          console.log(
            'final judejment',
            [1].includes(field.model?.law_ActivityTypeId) &&
              THIS._dynamicDialogConfig.data.rowData,
          );
          return !(
            [1].includes(field.model?.law_ActivityTypeId) &&
            THIS._dynamicDialogConfig.data.rowData
          );
        },
      },
    },
    {
      fieldGroupClassName:
        'grid gap-4 md:grid-cols-2 bg-white rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          className: 'col-span-2',
          expressionProperties: {
            template: (model) =>
              `<h5 class="mb-4 text-grey500 text-lg font-bold">
         ${model.law_ActivityType || ''}
       </h5>`,
          },
        },
        {
          key: 'activityStartDate',
          type: 'date',
          props: {
            label: THIS._languageService.getTransValue('matters.date'),
            required: true,
            showTime: true,
            hourFormat: '24',
            onSelect: (e: Date, field: FormlyFieldConfig) => {
              field.formControl?.setValue(e);
              THIS.formly?.get('startDate')?.setValue(e);
            },
          },
          hooks: {
            onInit: (field) => {
              if (!field?.formControl) return;

              const control = field.formControl;
              const rowData = THIS._dynamicDialogConfig?.data?.rowData;
              const isEditMode = !!rowData;

              let value: Date;

              if (isEditMode && rowData?.startDate) {
                value = new Date(rowData.startDate);
              } else {
                value = new Date();
              }

              if (!isNaN(value.getTime())) {
                control.setValue(value, { emitEvent: false });
              }
            },
          },
          expressions: {
            'props.readonly': 'formState.readonly',
            hide: (field: FormlyFieldConfig) =>
              ![3, 4, 5, 6, 7, 8].includes(field.model?.law_ActivityTypeId),
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
            hide: (field: FormlyFieldConfig) =>
              ![4].includes(field.model?.law_ActivityTypeId),
            'props.required': '[4].includes(field.model?.law_ActivityTypeId)',
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'location',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('matters.location'),
          },
          expressions: {
            hide: (field: FormlyFieldConfig) =>
              ![4].includes(field.model?.law_ActivityTypeId),
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'law_ActivityStatusId',
          type: 'select',
          defaultValue: !THIS._dynamicDialogConfig?.data?.rowData ? 1 : '',
          props: {
            label: THIS._languageService.getTransValue('matters.status'),
            required: true,
            optionsArr: THIS.lookupsData.activityStatus.result.map(
              (obj: any) => ({
                label: obj.name,
                value: obj.id,
              }),
            ),
          },
          expressions: {
            hide: (field: FormlyFieldConfig) =>
              ![2, 4, 5, 7].includes(field.model?.law_ActivityTypeId),
            'props.required':
              '[1,4, 7].includes(field.model?.law_ActivityTypeId)',
            'props.readonly': 'formState.readonly',
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
            hide: (field: FormlyFieldConfig) => {
              return ![2, 3, 5, 6, 8, 4, 7].includes(
                field.model?.law_ActivityTypeId,
              );
            },
            'props.required':
              '[2, 3, 5, 6, 8, 4, 7].includes(field.model?.law_ActivityTypeId)',
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
            hide: (field: FormlyFieldConfig) =>
              [1].includes(field.model?.law_ActivityTypeId),
            'props.readonly': 'formState.readonly',
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
            hide: (field: FormlyFieldConfig) => {
              return ![2, 3, 5, 6, 4, 7].includes(
                field.model?.law_ActivityTypeId,
              );
            },
            'props.readonly': 'formState.readonly',
          },
        },
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
      expressions: {
        hide: (field: FormlyFieldConfig) => {
          return (
            field.model?.law_ActivityTypeId == 1 ||
            !field.model?.law_ActivityTypeId
          );
        },
      },
    },
    createMeetingAttendeesSection(),
    {
      key: 'startDate',
      defaultValue: new Date(),
    },
  ];
}
