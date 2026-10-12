import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { FieldTypeConfig } from '@ngx-formly/core';
import { FieldType } from '@ngx-formly/core';
import { FormlyUploadImageCropComponent } from './formly-upload-image-crop/formly-upload-image-crop.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-formly-upload-image-field',
  templateUrl: './formly-upload-image-field.component.html',
  styleUrl: './formly-upload-image-field.component.scss',
})
export class FormlyUploadImageFieldComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  @ViewChild('fileInput')
  file!: File;
  fileAsBase64!: string;
  cdRef = inject(ChangeDetectorRef);
  fileInput!: ElementRef<HTMLInputElement>;
  _dialogService = inject(DialogService);
  _unsubscribeService = inject(UnsubscribeService);
  uploadedImage!: string;
  ngOnInit(): void {
    this.uploadedImage = this.formControl.value;
  }
  onFileChange(event: any) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.file = input.files[0];

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.onCropEditor();
        // this.uploadedImage = e.target.result; // Preview the image
      };
      reader.readAsDataURL(this.file);
    }
  }
  onCropEditor() {
    const ref = this._dialogService.open(FormlyUploadImageCropComponent, {
      header: 'Crop Image',
      width: '510px',
      data: this.file,
    });
    ref.onClose.pipe(this._unsubscribeService.takeUntilDestroy()).subscribe({
      next: (res: string) => {
        if (res) {
          this.uploadedImage = res;
          this.formControl.setValue(this.base64ToFile(res));
          this.cdRef.detectChanges();
        } else {
          this.formControl.setValue(this.formControl?.value);
          this.cdRef.detectChanges();
        }
      },
    });
  }
  
  base64ToFile(base64: string): File {
    // Extract the base64 data (removing the metadata prefix)
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    // Create and return the File object
    return new File([u8arr], this.file.name, { type: mime });
  }

  removeImage(event: MouseEvent) {
    event.stopPropagation();
    this.uploadedImage = '';
    this.formControl.reset(null);
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.file = undefined as any;
    this.cdRef.detectChanges();
    console.log(this.formControl.value);
    console.log(this.field.model);
    console.log(this.model);
  }
}
