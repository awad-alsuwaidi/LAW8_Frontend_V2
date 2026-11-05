import { FormlyFieldConfig } from '@ngx-formly/core';
import { MatterDetailsEditorComponent } from './matter-details-editor.component';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { resetFields } from 'src/app/@core/utilities/functions/reset-fields';
import { findField } from 'src/app/@core/utilities/functions/find-field';

export function matterDetailsEditorFields(
  THIS: MatterDetailsEditorComponent,
): FormlyFieldConfig[] {
  const isLitigation = (model: any) => model?.isLitigation === true;

  return [
    // ============================ Main Info ============================
    {
      fieldGroupClassName:
        'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 bg-white rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          className: 'col-span-3',
          template: `<h5 class="mb-4 text-grey500 text-lg font-bold"> ${THIS._languageService.getTransValue(
            'matters.mainInfo',
          )}</h5>`,
        },
        {
          className: 'col-span-3',
          fieldGroupClassName:
            'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
          fieldGroup: [
            {
              type: 'radio',
              key: 'requestTypeId',
              defaultValue: 1,
              props: {
                label: THIS._languageService.getTransValue(
                  'matters.requestType',
                ),
                options: [
                  {
                    label:
                      THIS._languageService.getTransValue('matters.supMatter'),
                    value: 2,
                  },
                  {
                    label:
                      THIS._languageService.getTransValue('matters.newMatter'),
                    value: 1,
                  },
                ],
                onChange: () => {
                  THIS.formly?.get('mtrNo')?.setValue(null);
                  THIS.formly?.get('clientId')?.setValue(null);
                },
              },
              expressions: {
                hide: () => THIS._router.url.includes('edit'),
              },
            },
          ],
        },

        {
          type: 'select',
          key: 'clientId',
          props: {
            label: THIS._languageService.getTransValue(
              THIS.isInhouse ? 'common.entitycode' : 'common.clientCode',
            ),
            optionsArr: getOptionsArray(
              THIS.lookupsData.clients.result,
              'id',
              'name',
            ),
            required: true,
            onChange: (e: DropdownChangeEvent) => {
              THIS.formly?.get('parentMatterId')?.reset();
              THIS.formly?.get('mtrNo')?.setValue(null);
              THIS.formlyModel.parentMatterId = null;
              THIS.formlyModel.mtrNo = null;
              THIS.formly?.get('parentMatterId')?.updateValueAndValidity();
              if (THIS.formlyModel.requestTypeId == 1) {
                THIS.getClientNameAndMattCodeByClient(e.value);
              }
              THIS.getParentMatterByClientId(e.value);
            },
          },
          expressions: {
            'props.disabled': () => !!THIS.matterIdentifier,
          },
        },
        {
          type: 'select',
          key: 'parentMatterId',
          props: {
            label: THIS._languageService.getTransValue(
              'matters.parentMatterCode',
            ),
            onChange: (e: DropdownChangeEvent) => {
              THIS.clearInheritedParties?.();
              if (THIS.formlyModel?.requestTypeId == 2) {
                THIS.getCLientNameAndMattCodeByClientAndParent(
                  THIS.formlyModel?.clientId,
                  THIS.formlyModel?.parentMatterId,
                );
              }
              THIS.getParentMatterParties(e.value);
            },
          },
          expressions: {
            // طه تاسك طه طه طااااااااهاااا

            // className: (field: FormlyFieldConfig) =>
            //   field.model?.requestTypeId === 2 ? 'order-2' : 'order-3',
            'props.required': (field: FormlyFieldConfig) =>
              field.model?.requestTypeId === 2,
            'props.disabled': () =>
              THIS.formlyModel?.requestTypeId === 2 && !!THIS.matterIdentifier,
          },
        },
        {
          type: 'input',
          key: 'mtrNo',
          props: {
            label: THIS._languageService.getTransValue('common.matterCode'),
            disabled: true,
            class: 'bg-inherit',
          },
          expressions: {
            // طه تاسك طه طه طااااااااهاااا
            // className: (field: FormlyFieldConfig) =>
            //   field.model?.requestTypeId === 2 ? 'order-3' : 'order-2',
          },
        },

        {
          type: 'input',
          key: 'descr',
          className: 'col-span-2 order-4',
          props: {
            label: THIS._languageService.getTransValue('common.description'),
            required: true,
          },
        },
        {
          type: 'input',
          key: 'matterBalance',
          className: 'order-5',
          props: {
            label: THIS._languageService.getTransValue('matters.matterBalance'),
          },
        },
        {
          type: 'date',
          key: 'openDate',
          className: 'order-6',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('matters.opened'),
          },
        },
        {
          type: 'date',
          key: 'closeDate',
          className: 'order-7',
          hide: THIS._router.url.includes('add'),
          props: {
            label: THIS._languageService.getTransValue('matters.close'),
          },
        },
        {
          type: 'select',
          key: 'law_BranchId',
          className: 'order-8',
          props: {
            label: THIS._languageService.getTransValue('common.branch'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.branches.result,
              'id',
              'name',
            ),
            required: true,
          },
        },
      ],
    },

    // ============================ Matter Details ============================
    {
      fieldGroupClassName:
        'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 bg-white rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          className: 'col-span-full',
          template: `<h5 class="mb-4 text-grey500 text-lg font-bold"> ${THIS._languageService.getTransValue(
            'matters.matterDetails',
          )}</h5>`,
        },
        {
          type: 'select',
          key: 'practsAreaId',
          props: {
            label: THIS._languageService.getTransValue('common.practiceArea'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.practiceArea.result,
              'id',
              'name',
            ),
            required: true,
            onChange: (e: DropdownChangeEvent) => {
              resetFields(THIS.formly, [
                'law_MtrCatId',
                'mtrTypeId',
                'jurisdictionId',
                'judicatureId',
                'courtNumber',
                'stageId',
                'statusId',
                'law_InstructorId',
                'tradmarkTypeId',
                'logoFileBase64',
                'wordMark',
                'isCaseSensitive',
              ]);
              const catField = findField(THIS.formlyFields, 'law_MtrCatId');
              if (catField) catField.props['optionsArr'] = [];

              const typeField = findField(THIS.formlyFields, 'mtrTypeId');
              if (typeField) typeField.props['optionsArr'] = [];

              const judField = findField(THIS.formlyFields, 'judicatureId');
              if (judField) judField.props['optionsArr'] = [];
              THIS.checkIsLitigation(e.value);
              THIS.getMatterCategoriesByPracticeArea(e.value);
              THIS._matterService.updateMatter(THIS.formlyModel);
            },
          },
        },
        {
          type: 'select',
          key: 'law_MtrCatId',
          props: {
            label: THIS._languageService.getTransValue('common.matterCategory'),
            required: true,
            onChange: (e: DropdownChangeEvent) => {
              resetFields(THIS.formly, ['mtrTypeId']);
              const typeField = findField(THIS.formlyFields, 'mtrTypeId');
              if (typeField) typeField.props['optionsArr'] = [];
              if (!THIS.isTrademarkCategory(e.value)) {
                resetFields(THIS.formly, [
                  'tradmarkTypeId',
                  'logoFileBase64',
                  'wordMark',
                  'isCaseSensitive',
                ]);
              }

              THIS.getMatterTypeByMatterCategory(e.value);
              THIS._matterService.updateMatter(THIS.formlyModel);
            },
          },
        },
        {
          type: 'select',
          key: 'mtrTypeId',
          props: {
            label: THIS._languageService.getTransValue('matters.matterType'),
            required: true,
          },
        },

        {
          type: 'select',
          key: 'jurisdictionId',
          props: {
            label: THIS._languageService.getTransValue('matters.jurisdicion'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.jurisdictions.result,
              'id',
              'name',
            ),
            onChange: (e: DropdownChangeEvent) => {
              resetFields(THIS.formly, ['judicatureId']);
              const judField = findField(THIS.formlyFields, 'judicatureId');
              if (judField) judField.props['optionsArr'] = [];
              THIS.getJudicatureByJurisdiction(e.value);
            },
          },
          expressions: {
            hide: (field: FormlyFieldConfig) =>
              !isLitigation(field.model) || !field.model?.practsAreaId,
          },
        },
        {
          type: 'select',
          key: 'judicatureId',
          props: {
            label: THIS._languageService.getTransValue('matters.court'),
          },
          expressions: {
            hide: (field: FormlyFieldConfig) => !isLitigation(field.model),
          },
        },
        {
          type: 'input',
          key: 'courtNumber',
          props: {
            label: THIS._languageService.getTransValue('matters.courtNumber'),
          },
          expressions: {
            hide: (field: FormlyFieldConfig) => !isLitigation(field.model),
          },
        },
        {
          type: 'select',
          key: 'statusId',
          defaultValue: 1,
          props: {
            label: THIS._languageService.getTransValue('matters.matterStatus'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.status.result,
              'id',
              'name',
            ),
          },
          expressions: {
            hide: (field: FormlyFieldConfig) =>
              field.model?.practsAreaId ==
                THIS.practiceArea.IntelecturualProperty ||
              !field.model?.practsAreaId,
          },
          expressionProperties: {
            'model.closeDate': (model: any) =>
              model.statusId === 3
                ? new Date().toISOString().split('T')[0]
                : null,
          },
        },
        {
          type: 'select',
          key: 'stageId',
          defaultValue: 2,
          props: {
            label: THIS._languageService.getTransValue('matters.stage'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.stages.result,
              'id',
              'name',
            ),
          },
          expressions: {
            hide: (field: FormlyFieldConfig) => !isLitigation(field.model),
          },
        },
        {
          type: 'select',
          key: 'law_InstructorId',
          className: 'col-span-3',
          props: {
            label: THIS._languageService.getTransValue('matters.instructor'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.clients.result,
              'id',
              'name',
            ),
          },
          // expressions: {
          //   hide: (field: FormlyFieldConfig) =>
          //     !field.model?.law_MtrCatId || field.model?.law_MtrCatId != 8,
          // },
          expressions: {
            hide: (field: FormlyFieldConfig) =>
              !THIS.isTrademarkCategory(field.model?.law_MtrCatId),
          },
        },
        {
          className: 'col-span-3',
          fieldGroupClassName: 'flex flex-wrap gap-4 items-end',
          fieldGroup: [
            {
              type: 'radio',
              key: 'tradmarkTypeId',
              className: 'flex-1 min-w-[180px]',
              props: {
                label: THIS._languageService.getTransValue(
                  'matters.tradmarkType',
                ),
                options: [
                  {
                    label: THIS._languageService.getTransValue('matters.logo'),
                    value: 1,
                  },
                  {
                    label: THIS._languageService.getTransValue('matters.word'),
                    value: 2,
                  },
                ],
                onChange: (e: DropdownChangeEvent) => {
                  if (e.value == 1) {
                    resetFields(THIS.formly, ['wordMark', 'isCaseSensitive']);
                  } else {
                    resetFields(THIS.formly, ['logoFileBase64']);
                  }
                },
              },
            },
            {
              type: 'inline-upload',
              key: 'logoFileBase64',
              className: 'flex-1 min-w-[200px]',
              props: {
                label: THIS._languageService.getTransValue('matters.logo'),
              },
              expressions: {
                hide: (field: FormlyFieldConfig) =>
                  field.model?.tradmarkTypeId != 1,
              },
            },
            {
              type: 'input',
              key: 'wordMark',
              className: 'flex-1 min-w-[180px]',
              props: {
                label: THIS._languageService.getTransValue('matters.wordMark'),
              },
              expressions: {
                hide: (field: FormlyFieldConfig) =>
                  field.model?.tradmarkTypeId != 2,
              },
            },
            {
              type: 'radio',
              key: 'isCaseSensitive',
              className: 'flex-1 min-w-[150px]',
              defaultValue: false,
              props: {
                label: THIS._languageService.getTransValue(
                  'matters.caseSensitive',
                ),
                name: 'isCaseSensitive',
                options: [
                  { label: 'No', value: false },
                  { label: 'Yes', value: true },
                ],
              },
              expressions: {
                hide: (field: FormlyFieldConfig) =>
                  field.model?.tradmarkTypeId != 2,
              },
            },
          ],
          // expressions: {
          //   hide: (field: FormlyFieldConfig) =>
          //     !field.model?.law_MtrCatId || field.model?.law_MtrCatId != 8,
          // },
          expressions: {
            hide: (field: FormlyFieldConfig) =>
              !THIS.isTrademarkCategory(field.model?.law_MtrCatId),
          },
        },

        {
          type: 'textarea',
          key: 'notes',
          className: 'col-span-3',
          props: {
            label: THIS._languageService.getTransValue('matters.notes'),
          },
        },
      ],
    },

    // ============================ Responsibilities ============================
    {
      fieldGroupClassName:
        'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-white rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          className: 'col-span-full',
          template: `<h5 class="mb-4 text-grey500 text-lg font-bold"> ${THIS._languageService.getTransValue(
            'matters.responsibilities',
          )}</h5>`,
        },
        {
          type: 'select',
          key: 'law_ResponsibleLaywerId',
          props: {
            label: THIS._languageService.getTransValue(
              'matters.responsibleLaywer',
            ),
            required: true,
            optionsArr: getOptionsArray(
              THIS.lookupsData.lawyer.result,
              'userId',
              'name',
            ),
          },
        },
        {
          type: 'multi-select',
          key: 'law_AssignedLaywerList',
          props: {
            label: THIS._languageService.getTransValue(
              'matters.assignedLaywer',
            ),
            optionsArr: getOptionsArray(
              THIS.lookupsData.lawyer.result,
              'userId',
              'name',
            ),
          },
        },
        {
          type: 'multi-select',
          key: 'law_OtherStaffList',
          props: {
            label: THIS._languageService.getTransValue('matters.otherStaff'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.responableLawyer.result,
              'userId',
              'name',
            ),
          },
        },
      ],
    },

    // ============================ Referrals ============================
    {
      fieldGroupClassName:
        'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-white rounded-2xl my-4 p-6',
      fieldGroup: [
        {
          className: 'col-span-full',
          template: `
        <h5 class="mb-4 text-grey500 text-lg font-bold">
          ${THIS._languageService.getTransValue('matters.referrals')}
        </h5>
      `,
        },
        {
          type: 'select',
          key: 'law_ReferralTypeId',
          props: {
            label: THIS._languageService.getTransValue('matters.referralType'),
            optionsArr: getOptionsArray(
              THIS.lookupsData.referralType.result,
              'id',
              'name',
            ),
          },
        },
        {
          type: 'select',
          key: 'law_ClientIntroducingId',
          props: {
            label: THIS._languageService.getTransValue(
              THIS.isInhouse
                ? 'matters.entityIntroducing'
                : 'matters.clientIntroducing',
            ),
            optionsArr: getOptionsArray(
              THIS.lookupsData.lawyer.result,
              'userId',
              'name',
            ),
          },
        },
        {
          type: 'select',
          key: 'law_MatterIntroducingLawyerId',
          props: {
            label: THIS._languageService.getTransValue(
              'matters.matterIntroducingLawyer',
            ),
            optionsArr: getOptionsArray(
              THIS.lookupsData.lawyer.result,
              'userId',
              'name',
            ),
          },
        },
      ],
    },
  ];
}
