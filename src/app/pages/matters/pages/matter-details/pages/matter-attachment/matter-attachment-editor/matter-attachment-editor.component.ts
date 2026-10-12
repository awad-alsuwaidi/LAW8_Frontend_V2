// import { Component, OnInit } from '@angular/core';
// import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
// import { matterAttachmentEditorFieldsConfig } from './matter-attachment-editor-formly.config';
// import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
// import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
// import { API_Config } from 'src/app/@core/api/api-config/api.config';
// import { ApiRes } from 'src/app/@core/models/apiRes-model';
// import { finalize } from 'rxjs';
// import { formatDate } from 'src/app/@core/utilities/functions/date-format';
// import { GLOBAL_DATE_TIME_Without_Seconds_FORMATE } from 'src/app/@core/utilities/defines/date-time';
// import { TranslateModule } from '@ngx-translate/core';

// @Component({
//   selector: 'app-matter-attachment-editor',
//   standalone: true,
//   imports: [FormlyConfigModule, SharedButtonComponent, TranslateModule],
//   templateUrl: './matter-attachment-editor.component.html',
//   styleUrl: './matter-attachment-editor.component.scss',
// })
// export class MatterAttachmentEditorComponent
//   extends FormBaseClass
//   implements OnInit
// {
//   ngOnInit(): void {
//     this.initForm();
//   }
//   override initForm(): void {
//     this.formlyFields = matterAttachmentEditorFieldsConfig(this);
//     if (this._dynamicDialogConfig.data.rowData) this.getData();
//   }
//  override getData(): void {
//   this.formlyModel = {
//     ...this._dynamicDialogConfig.data.rowData,

//     documentDate: this._dynamicDialogConfig.data.rowData.documentDate
//       ? formatDate(
//           this._dynamicDialogConfig.data.rowData.documentDate,
//           GLOBAL_DATE_TIME_Without_Seconds_FORMATE
//         )
//       : '',

//     expirationDate: this._dynamicDialogConfig.data.rowData.expirationDate
//       ? formatDate(
//           this._dynamicDialogConfig.data.rowData.expirationDate,
//           GLOBAL_DATE_TIME_Without_Seconds_FORMATE
//         )
//       : '',

//     receivedDate: this._dynamicDialogConfig.data.rowData.receivedDate
//       ? formatDate(
//           this._dynamicDialogConfig.data.rowData.receivedDate,
//           GLOBAL_DATE_TIME_Without_Seconds_FORMATE
//         )
//       : '',

//     attachment: null,
//   };
// }

//   override onSubmit(): void {
//     this.isLoading = true;
//     if (
//       !this.formlyModel.attachment ||
//       this.formlyModel.attachment.length === 0
//     ) {
//       this.isLoading = false;
//       this._toastrNotifiService.displayError(
//         'Please attach a document before saving.'
//       );
//       return;
//     }

//     const requestPayload = {
//       ...this.formlyModel,
//       documentDate: formatDate(
//         this.formlyModel.documentDate,
//         'yyyy-MM-ddTHH:mm:ss.SSSZ'
//       ),
//       // expirationDate: formatDate(
//       //   this.formlyModel.expirationDate,
//       //   'yyyy-MM-ddTHH:mm:ss.SSSZ'
//       // ),
//        expirationDate: this.formlyModel.expirationDate
//     ? formatDate(this.formlyModel.expirationDate, 'yyyy-MM-ddTHH:mm:ss.SSSZ')
//     : '',
//       receivedDate: formatDate(
//         this.formlyModel.receivedDate,
//         'yyyy-MM-ddTHH:mm:ss.SSSZ'
//       ),
//       ...(this._dynamicDialogConfig?.data?.rowData
//         ? { id: this._dynamicDialogConfig?.data?.rowData?.id }
//         : { Law_MatterId: this._dynamicDialogConfig?.data?.matterIdentifier }),
//     };

//     let formData = new FormData();
//     for (const [key, value] of Object.entries(requestPayload)) {
//       formData.append(key, `${value}`);
//     }

//     formData.append('attachment', this.formlyModel.attachment[0]);

//     const path = this._dynamicDialogConfig?.data?.rowData
//       ? API_Config.matterDocuments.update
//       : API_Config.matterDocuments.create;

//     this._apiService
//       .post(path, formData)
//       .pipe(
//         this._unsubscribe.takeUntilDestroy(),
//         finalize(() => (this.isLoading = false))
//       )
//       .subscribe({
//         next: (res: ApiRes) => {
//           if (res && res.isSuccess) {
//             this._toastrNotifiService.displaySuccess(res?.message);
//             this._dynamicDialogRef.close(true);
//           } else {
//             this._toastrNotifiService.displayError(res?.message);
//           }
//         },
//         error: (err: any) => {
//           this._toastrNotifiService.displayError(err?.error?.message);
//         },
//       });
//   }
// }

import { finalize } from 'rxjs';
import { FormlyFormOptions } from '@ngx-formly/core';
import { formatDate } from 'src/app/@core/utilities/functions/date-format';
import { GLOBAL_DATE_TIME_Without_Seconds_FORMATE } from 'src/app/@core/utilities/defines/date-time';
import { Component, inject, OnInit } from '@angular/core';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { matterAttachmentEditorFieldsConfig } from './matter-attachment-editor-formly.config';
import { FileService } from 'src/app/@shared/services/file/file.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';

@Component({
  selector: 'app-matter-attachment-editor',
  standalone: true,
  imports: [FormlyConfigModule, SharedButtonComponent, TranslateModule],
  templateUrl: './matter-attachment-editor.component.html',
  styleUrl: './matter-attachment-editor.component.scss',
})
export class MatterAttachmentEditorComponent
  extends FormBaseClass
  implements OnInit
{
  isEdit = false;
  documentId?: number;

  existingAttachmentPath?: string;
  existingAttachmentName?: string;
  _fileService = inject(FileService);

  override formlyOptions: FormlyFormOptions = {
    formState: {
      mode: 'create',
      changeAttachment: false,
    },
  };
  attachmentType: 'file' | 'url' = 'file';

  ngOnInit(): void {
    this.initForm();
  }

  override initForm(): void {
    this.formlyFields = matterAttachmentEditorFieldsConfig(this);

    this.documentId = this._dynamicDialogConfig.data?.id;
    this.isEdit = !!this.documentId;

    this.formlyOptions.formState.mode = this.isEdit ? 'edit' : 'create';

    if (this.isEdit) {
      this.getById(this.documentId!);
    }
  }

  private getById(id: number) {
    this.isLoading = true;

    this._apiService
      .get(API_Config.matterDocuments.getById, { id, loadFile: false })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (!res?.isSuccess) return;

          const r = res.result;

          this.attachmentType =
            r.matterDocumentSourceType === 'Link' ? 'url' : 'file';

          this.existingAttachmentPath = r.attachmentPath || r.attachment || '';

          this.existingAttachmentName =
            r.attachmentName ||
            this.getFileNameFromUrl(this.existingAttachmentPath);

          this.formlyModel = {
            ...r,

            attachmentType: this.attachmentType,
            linkURL:
              this.attachmentType === 'url'
                ? r.attachmentPath || r.attachment || ''
                : '',

            documentDate: r.documentDate
              ? formatDate(
                  r.documentDate,
                  GLOBAL_DATE_TIME_Without_Seconds_FORMATE,
                )
              : '',

            expirationDate: r.expirationDate
              ? formatDate(
                  r.expirationDate,
                  GLOBAL_DATE_TIME_Without_Seconds_FORMATE,
                )
              : '',

            receivedDate: r.receivedDate
              ? formatDate(
                  r.receivedDate,
                  GLOBAL_DATE_TIME_Without_Seconds_FORMATE,
                )
              : '',

            attachment: null,
          };
        },

        error: () => {},
      });
  }

  viewExistingAttachment() {
    if (!this.existingAttachmentPath) return;
    this._fileService.previewFileFromPath(this.existingAttachmentPath);
  }

  changeAttachmentType(type: 'file' | 'url'): void {
    this.attachmentType = type;

    this.formlyModel.attachment = null;

    if (type === 'file') {
      this.formlyModel.linkURL = '';
    } else {
      this.formlyModel.linkURL = '';
    }
  }

  enableChangeAttachment() {
    this.formlyOptions.formState.changeAttachment = true;
  }

  cancelChangeAttachment() {
    this.formlyOptions.formState.changeAttachment = false;
    this.formlyModel.attachment = null;
  }

  private getFileNameFromUrl(url?: string) {
    if (!url) return '';
    try {
      const clean = url.split('?')[0];
      return clean.substring(clean.lastIndexOf('/') + 1);
    } catch {
      return '';
    }
  }

  override onSubmit(): void {
    this.isLoading = true;

    const changeAttachment = !!this.formlyOptions.formState.changeAttachment;

    const hasNewFile =
      this.formlyModel?.attachment && this.formlyModel.attachment.length > 0;

    const hasUrl = !!this.formlyModel?.linkURL?.trim();
    if (!this.isEdit) {
      if (this.attachmentType === 'file' && !hasNewFile) {
        this.isLoading = false;
        this._toastrNotifiService.displayError('Please attach a document.');
        return;
      }

      if (this.attachmentType === 'url' && !hasUrl) {
        this.isLoading = false;
        this._toastrNotifiService.displayError('Please enter a valid URL.');
        return;
      }
    }
    if (this.isEdit && changeAttachment) {
      if (this.attachmentType === 'file' && !hasNewFile) {
        this.isLoading = false;
        this._toastrNotifiService.displayError(
          'Please choose a new attachment.',
        );
        return;
      }

      if (this.attachmentType === 'url' && !hasUrl) {
        this.isLoading = false;
        this._toastrNotifiService.displayError('Please enter a valid URL.');
        return;
      }
    }

    const requestPayload: any = {
      id: this.isEdit ? this.documentId : undefined,

      Law_MatterId: this.isEdit
        ? (this.formlyModel?.law_MatterId ?? this.formlyModel?.Law_MatterId)
        : this._dynamicDialogConfig?.data?.matterIdentifier,

      description: this.formlyModel.description,

      documentDate: formatDate(this.formlyModel.documentDate, 'yyyy-MM-dd'),

      expirationDate: this.formlyModel.expirationDate
        ? formatDate(this.formlyModel.expirationDate, 'yyyy-MM-dd')
        : '',

      receivedDate: formatDate(this.formlyModel.receivedDate, 'yyyy-MM-dd'),
      matterDocumentSourceType: this.attachmentType === 'url' ? 'Link' : 'File',

      linkURL: this.attachmentType === 'url' ? this.formlyModel.linkURL : '',
    };
    Object.keys(requestPayload).forEach(
      (key) => requestPayload[key] === undefined && delete requestPayload[key],
    );

    const formData = new FormData();

    for (const [key, value] of Object.entries(requestPayload)) {
      formData.append(key, value as any);
    }
    if (
      this.attachmentType === 'file' &&
      (!this.isEdit || (changeAttachment && hasNewFile))
    ) {
      formData.append('attachment', this.formlyModel.attachment[0]);
    }

    const path = this.isEdit
      ? API_Config.matterDocuments.update
      : API_Config.matterDocuments.create;

    this._apiService
      .post(path, formData)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            this._toastrNotifiService.displaySuccess(res?.message);

            this._dynamicDialogRef.close(true);
          } else {
            this._toastrNotifiService.displayError(res?.message);
          }
        },

        error: (err: any) => {
          const validationErrors = err?.error?.errors as Record<
            string,
            string[]
          >;

          if (validationErrors) {
            const errorMessages: Record<string, string> = {
              DocumentDate:
                'Document Date is required. Please select a valid date.',

              ReceivedDate: 'Received Date is required.',

              ExpirationDate: 'Please enter a valid Expiration Date.',

              Description: 'Please enter a description.',

              Attachment: 'Please attach a document.',

              LinkURL: 'Please enter a valid URL.',
            };

            const firstKey = Object.keys(validationErrors)[0];

            const customMessage = errorMessages[firstKey];

            this._toastrNotifiService.displayError(
              customMessage || 'Please fill all required fields correctly.',
            );
          } else {
            this._toastrNotifiService.displayError('Something went wrong');
          }
        },
      });
  }
}
