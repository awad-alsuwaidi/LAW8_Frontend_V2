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

  existingAttachmentExtension?: string;
  attachmentType: 'file' | 'url' = 'file';
  _fileService = inject(FileService);

  override formlyOptions: FormlyFormOptions = {
    formState: { mode: 'create', changeAttachment: false },
  };

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

    const url = API_Config.matterDocuments.getById.includes('{id}')
      ? API_Config.matterDocuments.getById.replace('{id}', String(id))
      : API_Config.matterDocuments.getById;

    this._apiService
      .get(url, { loadFile: false })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.isSuccess ?? res?.success;
          const r = res?.result ?? res?.data;
          if (!isSuccess || !r) return;

          const isLink =
            r.isLink === true || r.matterDocumentSourceType === 'Link';
          this.attachmentType = isLink ? 'url' : 'file';

          const filePath =
            r.attachmentPath || r.attachment || r.filePath || r.fileUrl || '';
          const linkPath = r.url || r.linkURL || '';

          this.existingAttachmentPath = isLink ? linkPath : filePath;

          this.existingAttachmentName =
            r.name ||
            r.originalFileName ||
            this.getFileNameFromUrl(this.existingAttachmentPath);
          this.existingAttachmentExtension = r.extension || '';

          const matterId = r.matterId ?? r.law_MatterId ?? r.Law_MatterId;

          this.formlyModel = {
            ...r,
            attachmentType: this.attachmentType,
            linkURL: isLink ? linkPath : '',
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
            isActive: r.isActive ?? true,
            sharedWithClient: r.sharedWithClient ?? false,
            matterId,
            law_MatterId: matterId,
            Law_MatterId: matterId,
            attachment: null,
          };
        },
        error: () => {},
      });
  }

  viewExistingAttachment() {
    if (this.attachmentType === 'url' || this.formlyModel?.isLink) {
      const url =
        this.formlyModel?.linkURL ||
        this.formlyModel?.url ||
        this.existingAttachmentPath;
      if (!url) {
        this._toastrNotifiService.displayError('Link is not available.');
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (!this.documentId) {
      this._toastrNotifiService.displayError(
        'Attachment file is not available yet.',
      );
      return;
    }
    const ext =
      this.existingAttachmentExtension?.replace('.', '').toLowerCase() || '';
    const previewExtensions = [
      'pdf',
      'png',
      'jpg',
      'jpeg',
      'svg',
      'gif',
      'bmp',
      'webp',
    ];
    const canPreview = previewExtensions.includes(ext);

    if (canPreview) {
      this._fileService
        .downloadMatterDocument(this.documentId, true)
        .subscribe({
          next: (response: any) => {
            const blob = new Blob([response.body], {
              type:
                response.headers.get('content-type') ??
                'application/octet-stream',
            });
            const blobUrl = window.URL.createObjectURL(blob);
            window.open(blobUrl, '_blank', 'noopener,noreferrer');
          },
          error: (err) => console.error('Preview failed:', err),
        });
    } else {
      this._fileService
        .downloadMatterDocument(this.documentId, false)
        .subscribe({
          next: (response: any) => {
            const blob = new Blob([response.body], {
              type:
                response.headers.get('content-type') ??
                'application/octet-stream',
            });
            const fileName = this.formlyModel?.description
              ? `${this.formlyModel.description}${this.existingAttachmentExtension || ''}`
              : (this.formlyModel?.originalFileName ??
                `document_${this.documentId}`);

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          },
          error: (err) => {
            console.error('Download failed:', err);
          },
        });
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

    if (
      this.attachmentType === 'file' &&
      (!this.isEdit || changeAttachment) &&
      !hasNewFile
    ) {
      this.isLoading = false;
      this._toastrNotifiService.displayError('Please attach a document.');
      return;
    }
    if (
      this.attachmentType === 'url' &&
      (!this.isEdit || changeAttachment) &&
      !hasUrl
    ) {
      this.isLoading = false;
      this._toastrNotifiService.displayError('Please enter a valid URL.');
      return;
    }

    const matterId = this.isEdit
      ? ((this.formlyModel as any)?.matterId ??
        (this.formlyModel as any)?.law_MatterId ??
        (this.formlyModel as any)?.Law_MatterId)
      : this._dynamicDialogConfig?.data?.matterIdentifier;

    const requestPayload: any = {
      id: this.isEdit ? this.documentId : undefined,
      matterId,
      description: this.formlyModel.description,
      documentDate: formatDate(this.formlyModel.documentDate, 'yyyy-MM-dd'),
      expirationDate: this.formlyModel.expirationDate
        ? formatDate(this.formlyModel.expirationDate, 'yyyy-MM-dd')
        : '',
      receivedDate: formatDate(this.formlyModel.receivedDate, 'yyyy-MM-dd'),

      isActive: this.formlyModel.isActive ?? true,
      sharedWithClient: this.formlyModel.sharedWithClient ?? false,

      isLink: this.attachmentType === 'url',
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
      formData.append('file', this.formlyModel.attachment[0]);
    }

    let path = this.isEdit
      ? API_Config.matterDocuments.update
      : API_Config.matterDocuments.create;

    if (this.isEdit) {
      if (path.includes('{id}')) {
        path = path.replace('{id}', String(this.documentId));
      }
    } else {
      if (path.includes('{matterId}')) {
        path = path.replace('{matterId}', String(matterId));
      }
    }
    const request$ = this.isEdit
      ? this._apiService.put(path, formData)
      : this._apiService.post(path, formData);

    request$
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          if (isSuccess) {
            this._toastrNotifiService.displaySuccess(res?.message);
            this._dynamicDialogRef.close(true);
          } else {
            this._toastrNotifiService.displayError(
              res?.message || 'Something went wrong',
            );
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
              File: 'Please attach a document.',
              LinkURL: 'Please enter a valid URL.',
            };
            const firstKey = Object.keys(validationErrors)[0];
            this._toastrNotifiService.displayError(
              errorMessages[firstKey] ||
                'Please fill all required fields correctly.',
            );
          } else {
            this._toastrNotifiService.displayError(
              err?.error?.message || 'Something went wrong',
            );
          }
        },
      });
  }
}
