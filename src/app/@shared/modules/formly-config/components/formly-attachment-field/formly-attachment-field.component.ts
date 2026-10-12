import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';


@Component({
  selector: 'app-formly-attachment-field',
  templateUrl: './formly-attachment-field.component.html',
  styleUrl: './formly-attachment-field.component.scss'
})
export class FormlyAttachmentFieldComponent extends FieldType<FieldTypeConfig> implements OnInit {
  files: File[] = [];
  _cdr = inject(ChangeDetectorRef);
  ngOnInit(): void {

    if (typeof this.formControl.value === 'string') {
      const fileInfo = this.getFileInfo(this.formControl.value);
      let file = new File([this.formControl.value], fileInfo.fileName, { type: fileInfo.mimeType })
      this.files = [file]
    } else {
      this.formControl?.value?.forEach((filePath: string) => {

        const fileInfo = this.getFileInfo(filePath);
        let file = new File([filePath], fileInfo.fileName, { type: fileInfo.mimeType })
        this.files.push(file)
      });
    }
  }
  onSelect(event: any) {
    this.files = event.rejectedFiles;
    this.formControl.setValue(this.files)
  }

  onRemove(file: any) {
    this.files.splice(this.files.indexOf(file), 1);
    this.formControl.setValue(this.files)
    this._cdr.detectChanges();
  }

  private getFileInfo(url: string) {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    const fileName = pathname.substring(pathname.lastIndexOf('/') + 1);

    const fileExtension = fileName?.split('.')?.pop()?.toLowerCase();

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

    return { fileName, mimeType };
  }

}
