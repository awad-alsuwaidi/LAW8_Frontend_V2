import { FormlyFieldConfig } from '@ngx-formly/core';
import { MatterPartyEditorComponent } from './matter-party-editor.component';

export function matterPartyEditorFieldsConfig(
  THIS: MatterPartyEditorComponent,
): FormlyFieldConfig[] {
  const partyTypes = (): any[] => {
    const r = THIS.lookupsData?.partyType?.result;
    return Array.isArray(r) ? r : [];
  };
  const partyDescriptions = (): any[] => {
    const r = THIS.lookupsData?.partyDescription?.result;
    return Array.isArray(r) ? r : [];
  };

  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-2',
      fieldGroup: [
        {
          key: 'partyTypeId',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('matters.partyType'),
            required: true,
            optionsArr: partyTypes().map((obj: any) => ({
              label: obj.name,
              value: +obj.id,
            })),
            onChange: (e: any) => {
              const item = partyTypes().find((p: any) => +p.id === +e.value);
              THIS.formly?.get('partyType')?.setValue(item?.name ?? '');
            },
          },
        },
        {
          key: 'partyType',
        },

        {
          key: 'name',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('matters.partyName'),
            required: true,
          },
        },

        {
          key: 'partyDescriptionId',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('matters.party'),
            optionsArr: partyDescriptions().map((obj: any) => ({
              label: obj.name,
              value: obj.id,
            })),
            onChange: (e: any) => {
              THIS.getPositionByDescriptionId(e.value);
              const item = partyDescriptions().find(
                (p: any) => p.id === e.value,
              );
              THIS.formly?.get('partyDescription')?.setValue(item?.name ?? '');
            },
          },
          expressions: {
            hide: (field: FormlyFieldConfig) =>
              field.model?.partyTypeId == 6 || field.model?.partyTypeId == 7,
          },
        },
        {
          key: 'partyDescription',
        },

        {
          key: 'position',
          type: 'select',
          props: {
            label: THIS._languageService.getTransValue('matters.position'),
          },
          expressions: {
            hide: (field: FormlyFieldConfig) =>
              field.model?.partyTypeId == 6 || field.model?.partyTypeId == 7,
          },
        },
      ],
    },
  ];
}
