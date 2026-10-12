import { FormlyFieldConfig } from '@ngx-formly/core';
import { ClientsEditorMainInfoComponent } from './clients-editor-main-info.component';
import { CLIENT_TYPE_OPTIONS, ClientType } from 'src/app/pages/clients/services/client-type';

export function clientsEditorMainInfoFormlyFieldsConfig(
  THIS: ClientsEditorMainInfoComponent,
): FormlyFieldConfig[] {
  const isView =
    THIS._router.url.includes('view') || THIS._router.url.includes('details');

  return [
    {
      fieldGroupClassName: 'grid grid-cols-1 md:grid-cols-6 gap-6 mb-6',
      fieldGroup: [
        {
          key: 'image',
          type: 'upload-image',
          className: 'md:col-span-6 flex',
          props: {
            label: THIS._languageService.getTransValue(
              THIS.isInhouse ? 'clients.imageentity' : 'clients.image',
            ),
            hint: THIS._languageService.getTransValue('clients.imageSizeHint'),
          },
          expressions: {
            'props.readonly': 'formState.readonly',
            hide: () => THIS._router.url.includes('view'),
          },
        },
        {
          key: 'clientCode',
          type: 'input',
          className: 'md:col-span-2',
          defaultValue: THIS.lookupsData?.clientCode?.result,
          props: {
            // label: THIS._languageService.getTransValue('clients.clientCode'),
            label: THIS._languageService.getTransValue(
              THIS.isInhouse ? 'common.entitycode' : 'clients.clientCode',
            ),
            disabled: true,
            required: true,
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key:
            THIS._languageService.getSelectedLanguage() == 'en'
              ? 'nameEn'
              : 'nameAr',
          type: 'input',
          className: 'md:col-span-2',
          props: {
            // label: THIS._languageService.getTransValue('clients.name'),
            label: THIS._languageService.getTransValue(
              THIS.isInhouse ? 'common.entityname' : 'clients.name',
            ),
            required: true,
            placeholder: 'Name',
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key:
            THIS._languageService.getSelectedLanguage() == 'en'
              ? 'nameAr'
              : 'nameEn',
          type: 'input-btn',
          className: 'md:col-span-2',
          props: {
            label: THIS._languageService.getTransValue('clients.foreignName'),
            btnIcon: 'icon-speech !text-2xl hover:!text-primary',
            btnClass: '!p-0',
            placeholder: 'Foreign name',
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'clientGroupId',
          type: 'select',
          className: 'md:col-span-2',
          defaultValue: 1,
          props: {
            // label: THIS._languageService.getTransValue('clients.clientGroup'),
            label: THIS._languageService.getTransValue(
              THIS.isInhouse ? 'common.entityGroup' : 'clients.clientGroup',
            ),
            optionsArr: [],
            selectedObj: {},
            optionLabel: 'name',
            optionValue: 'id',
            placeholder: 'Select group',
            onChange: () => {
              THIS.getClientGroupOptions();
              THIS.setClientGroupValue();
            },
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'introducingLawyer',
          type: 'select',
          className: 'md:col-span-2',
          props: {
            label: THIS._languageService.getTransValue(
              'clients.introducingLawyer',
            ),
            optionsArr: [],
            selectedObj: {},
            optionLabel: 'name',
            optionValue: 'id',
            placeholder: 'Select lawyer',
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
        {
          key: 'clientType',
          type: 'select',
          className: 'md:col-span-2',
          defaultValue: ClientType.Individual,
          props: {
            label: THIS._languageService.getTransValue('clients.clientType'),
            required: true,
            showFilter:false,
            optionsArr: CLIENT_TYPE_OPTIONS.map((opt) => ({
              label: THIS._languageService.getTransValue(opt.label),
              value: opt.value,
            })),
            optionLabel: 'label',
            optionValue: 'value',
            placeholder: THIS._languageService.getTransValue(
              'clients.selectClientType',
            ),
            selectedObj: {},
          },
          expressions: {
            'props.readonly': 'formState.readonly',
          },
        },
      ],
    },
  ];
}
