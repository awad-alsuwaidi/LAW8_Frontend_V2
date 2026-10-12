import { ChangeDetectorRef, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { FileService } from 'src/app/@shared/services/file/file.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-formly-attachment-list-field',
  templateUrl: './formly-attachment-list-field.component.html',
  styleUrl: './formly-attachment-list-field.component.scss',
})
export class FormlyAttachmentListFieldComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit, OnDestroy
{
  files: any[] = [];
  _cdr = inject(ChangeDetectorRef);
  _fileService = inject(FileService);
  existingAttachments: any[] = [];  
  newFiles: File[] = [];            
  referenceDocs: any[] = [];        
  deletedAttachmentIds: number[] = [];
  private _valueChangesSub?: Subscription;
  private _isInternalUpdate = false;

  ngOnInit(): void {
    this.buildFilesFromValue(this.formControl.value);

    this.props['deletedAttachmentIds'] = [];

    this._valueChangesSub = this.formControl.valueChanges.subscribe((value) => {
      if (this._isInternalUpdate) {
        this._isInternalUpdate = false;
        return;
      }
      this.buildFilesFromValue(value);
      this._cdr.detectChanges();
    });

    this.props['registerApi']?.(this);
  }

  ngOnDestroy(): void {
    this._valueChangesSub?.unsubscribe();
  }

  private buildFilesFromValue(value: any): void {
    const items = value || [];

    if (typeof value === 'string') {
      const fileInfo = this.getFileInfo(value);
      this.files = [new File([value], fileInfo.name, { type: fileInfo.mimeType })];
      this.existingAttachments = [];
      this.newFiles = [];
      this.referenceDocs = [];
      return;
    }

    this.existingAttachments = [];
    this.newFiles = [];
    this.referenceDocs = [];
    this.files = [];

    items.forEach((obj: any) => {
      if (obj?.isReference) {
        this.referenceDocs.push(obj);
        this.files.push(obj);
        return;
      }
      if (obj instanceof File) {
        this.newFiles.push(obj);
        this.files.push(obj);
        return;
      }
      const fileInfo = this.getFileInfo(obj.filePath, obj.fileName);
      const file: any = new File([obj.filePath], obj.fileName, {
        type: fileInfo.mimeType,
      });
      file.id = obj.id;
      file.filePath = obj.filePath;

      this.existingAttachments.push(file);
      this.files.push(file);
    });
  }

  onSelect(event: any) {
    this.newFiles.push(...event.addedFiles);
    this.files = [...this.files, ...event.addedFiles];

    this._isInternalUpdate = true;
    this.formControl.setValue([
      ...this.existingAttachments,
      ...this.referenceDocs,
      ...this.newFiles,
    ]);
  }

  private getFileInfo(url: string, fileName?: string) {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const name = fileName ?? pathname.substring(pathname.lastIndexOf('/') + 1);
    const fileExtension = name?.split('.')?.pop()?.toLowerCase();

    const mimeTypes: any = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
      txt: 'text/plain',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    const mimeType = mimeTypes[fileExtension as string] || 'application/octet-stream';
    return { name, mimeType };
  }

  onRemove(file: any) {
    if (file?.isReference) {
      this.referenceDocs = this.referenceDocs.filter((x) => x.id !== file.id);
    } else if (file.id) {
      this.props['deletedAttachmentIds'].push(file.id);
      this.existingAttachments = this.existingAttachments.filter((x) => x.id !== file.id);
    } else {
      this.newFiles = this.newFiles.filter((x) => x !== file);
    }

    this.files = this.files.filter((x) => x !== file);

    this._isInternalUpdate = true;
    this.formControl.setValue([
      ...this.existingAttachments,
      ...this.referenceDocs,
      ...this.newFiles,
    ]);

    this._cdr.detectChanges();
  }

private triggerDownload(blob: Blob, fileName: string): void {
  if (!blob) {
    return;
  }

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'download';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}
downloadFile(index: number, file: any) {
  const attachment = this.formControl.value?.[index];

  if (!attachment) {
    console.warn('FormlyAttachmentList: No attachment found');
    return;
  }

  // ============================================================
  // 1. Custom download function
  // ============================================================
  if (this.props['downloadFn']) {
    this.props['downloadFn'](attachment, file);
    return;
  }

  // ============================================================
  // 2. Reference Document from Matter
  // ============================================================
  if (attachment?.isReference) {
    const documentId =
      attachment?.documentId ??
      attachment?.id ??
      attachment?.__docId;

    if (documentId == null) {
      console.warn(
        'FormlyAttachmentList: Reference document has no ID',
        attachment
      );
      return;
    }

    this._fileService
      .downloadDocument(documentId)
      .subscribe({
        next: (res: any) => {
          const blob = res.body;

          if (!blob) {
            console.error(
              'FormlyAttachmentList: Download returned empty blob'
            );
            return;
          }

          const fileName =
            attachment?.fileName ||
            attachment?.name ||
            file?.name ||
            `document_${documentId}`;

          this.triggerDownload(blob, fileName);
        },
        error: (err) => {
          console.error(
            'FormlyAttachmentList: Reference document download failed',
            err
          );
        },
      });

    return;
  }

  // ============================================================
  // 3. Local File
  // ============================================================
  if (attachment instanceof File) {
    this._fileService.downloadFile(attachment);
    return;
  }

  if (attachment?.file instanceof File) {
    this._fileService.downloadFile(attachment.file);
    return;
  }

  // ============================================================
  // 4. Existing Server Attachment with filePath
  // ============================================================
  if (attachment?.filePath) {
    this._fileService.downloadFileFromPath(
      attachment.filePath,
      attachment.fileName || attachment.name || file?.name || 'file'
    );

    return;
  }

  // ============================================================
  // 5. No download source
  // ============================================================
  console.warn(
    'FormlyAttachmentList: Cannot determine download source',
    attachment
  );
}

  canDownload(file: any): boolean {
    return !!file.id && !file.isReference;
  }

  setReferenceDocuments(refDocs: { id: any; fileName: string }[]): void {
    this.referenceDocs = refDocs.map((d) => ({
      id: d.id,
      name: d.fileName,
      isReference: true,
    }));

    this.files = [...this.existingAttachments, ...this.referenceDocs, ...this.newFiles];

    this._isInternalUpdate = true;
    this.formControl.setValue([
      ...this.existingAttachments,
      ...this.referenceDocs,
      ...this.newFiles,
    ]);

    this._cdr.detectChanges();
  }

  getExistingDocumentIds(): any[] {
    return this.referenceDocs.map((d) => d.id);
  }
}