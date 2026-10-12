import { FormlyFieldConfig } from '@ngx-formly/core';
import { MatterAttachmentEditorComponent } from './matter-attachment-editor.component';

export function matterAttachmentEditorFieldsConfig(
  THIS: MatterAttachmentEditorComponent,
): FormlyFieldConfig[] {
  return [
    {
      fieldGroupClassName: 'grid gap-4 md:grid-cols-2',
      fieldGroup: [
        // {
        //   className: 'col-span-2',
        //   key: 'attachment',
        //   type: 'attachment',
        //   props: {
        //     label: THIS._languageService.getTransValue('matters.document'),
        //     required: true,
        //   },
        // },
        //       {
        //   className: 'col-span-2',
        //   key: 'attachment',
        //   type: 'attachment',
        //   props: {
        //     label: THIS._languageService.getTransValue('matters.document'),
        //   },
        //   hideExpression: (_m, fs) => fs?.mode === 'edit' && !fs?.changeAttachment,
        //   expressionProperties: {
        //     'props.required': (_m, fs) => fs?.mode === 'create' || !!fs?.changeAttachment,
        //   },
        // },
        {
          className: 'col-span-2',
          key: 'attachmentType',
          type: 'radio',
          defaultValue: 'file',

          hideExpression: () => THIS.isEdit,

          props: {
            label: 'Attachment Type',
            options: [
              {
                label: 'Hyperlink',
                value: 'url',
              },
              {
                label: 'Document',
                value: 'file',
              },
            ],
          },

          hooks: {
            onInit: (field) => {
              field.formControl?.valueChanges.subscribe((value) => {
                THIS.attachmentType = value;

                if (value === 'file') {
                  field.form?.get('linkURL')?.setValue('');
                } else {
                  field.form?.get('attachment')?.setValue(null);
                }
              });
            },
          },
        },
        {
          className: 'col-span-2',
          key: 'attachment',
          type: 'attachment',
          props: {
            label: THIS._languageService.getTransValue('matters.document'),
          },
          hideExpression: () =>
            THIS.attachmentType !== 'file' ||
            (THIS.isEdit && !THIS.formlyOptions.formState.changeAttachment),

          expressionProperties: {
            'props.required': () =>
              THIS.attachmentType === 'file' &&
              (!THIS.isEdit || !!THIS.formlyOptions.formState.changeAttachment),
          },

          hooks: {
            onInit: (field) => {
              field.formControl?.valueChanges.subscribe((files: File[]) => {
                if (files?.length) {
                  const fileName = files[0].name.replace(/\.[^/.]+$/, '');

                  field.form?.get('description')?.setValue(fileName);
                }
              });
            },
          },
        },
        {
          className: 'col-span-2',
          key: 'linkURL',
          type: 'input',
          props: {
            label: 'Hyperlink / URL',
            placeholder: 'https://example.com/document',
          },
          hideExpression: () => THIS.isEdit || THIS.attachmentType !== 'url',
          expressionProperties: {
            'props.required': () =>
              !THIS.isEdit && THIS.attachmentType === 'url',
          },
        },
        {
          className: 'col-span-2',
          key: 'description',
          type: 'input',
          props: {
            label: THIS._languageService.getTransValue('common.description'),
          },
        },
        {
          key: 'receivedDate',
          type: 'date',
          defaultValue: new Date(),
          props: {
            label: THIS._languageService.getTransValue('matters.receivedDate'),
            required: true,
          },
        },
        {
          key: 'documentDate',
          type: 'date',
          props: {
            label: THIS._languageService.getTransValue('matters.documentDate'),
            required: true,
          },
        },
        {
          key: 'expirationDate',
          type: 'date',
          props: {
            label: THIS._languageService.getTransValue(
              'matters.expirationDate',
            ),
            // required: true,
          },
        },
      ],
    },
  ];
}
