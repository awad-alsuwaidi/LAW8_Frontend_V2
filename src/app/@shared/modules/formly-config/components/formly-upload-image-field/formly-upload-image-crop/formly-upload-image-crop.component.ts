import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ImageCroppedEvent, ImageCropperComponent, ImageTransform } from 'ngx-image-cropper';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';

@Component({
  selector: 'app-formly-upload-image-crop',
  standalone: true,
  imports: [
    ImageCropperComponent,
    SharedButtonComponent,
    TranslateModule,
    FormsModule,
    SliderModule
  ],
  templateUrl: './formly-upload-image-crop.component.html',
  styleUrl: './formly-upload-image-crop.component.scss'
})
export class FormlyUploadImageCropComponent {
  imageChangedEvent: Event | null = null;
  croppedImage: any;
  croppedFile: any;
  croppedBase64: any;
  croppedBlob: any;
  fileName!: string
  dynamicDialogConfig = inject(DynamicDialogConfig)
  dynamicDialogRef = inject(DynamicDialogRef);
  scale: number = 1; // التكبير الافتراضي
  transform: ImageTransform = {};
  constructor(private sanitizer: DomSanitizer) { }
  ngOnInit(): void {
    this.fileName = this.dynamicDialogConfig.data.name
    this.convertFileToInputEvent(this.dynamicDialogConfig.data)
  }
  convertFileToInputEvent(file: File) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file)

    // Manually construct the Event
    const inputEvent = new Event('change', {
      bubbles: true,
      cancelable: true,
    }) as InputEvent;

    // Assign the `files` to the `target` property
    Object.defineProperty(inputEvent, 'target', {
      writable: true,
      value: {
        files: dataTransfer.files,
      },
    });
    this.imageChangedEvent = inputEvent
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedBase64 = event.base64
    this.croppedBlob = event.objectUrl

    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl || event.base64 || '');
    // event.blob can be used to upload the cropped image
  }

  onScaleChange(): void {
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }
}