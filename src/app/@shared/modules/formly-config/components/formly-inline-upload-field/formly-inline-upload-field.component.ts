import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-inline-upload-field',
  templateUrl: './formly-inline-upload-field.component.html',
  styleUrl: './formly-inline-upload-field.component.scss',
})
export class FormlyInlineUploadFieldComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  _cdRef = inject(ChangeDetectorRef);
  fileUrl: string | ArrayBuffer | null = null;
  @ViewChild('uploadFile') uploadFile!: ElementRef;

  ngOnInit(): void {
    if (this.formControl.value) {
      this.fileUrl = this.formControl.value;
    }
    console.log('value', this.formControl.value);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (this.props['returnType'] === 'file') {
        const blob = new Blob([file], { type: file.type });
        this.formControl.setValue(file);
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.fileUrl = reader.result;
        if (!this.props['returnType']) {
          this.formControl.setValue(reader.result);
          this._cdRef.detectChanges();
        }
        // this.formControl.setValue(base64)
      };
      reader.readAsDataURL(file);
    }
  }

  reset() {
    this.fileUrl = null;
    this.uploadFile.nativeElement.value = null;
  }
}
