import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyUploadImageCropComponent } from './formly-upload-image-crop.component';

describe('FormlyUploadImageCropComponent', () => {
  let component: FormlyUploadImageCropComponent;
  let fixture: ComponentFixture<FormlyUploadImageCropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyUploadImageCropComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyUploadImageCropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
