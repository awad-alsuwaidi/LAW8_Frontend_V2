import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyUploadImageFieldComponent } from './formly-upload-image-field.component';

describe('FormlyUploadImageFieldComponent', () => {
  let component: FormlyUploadImageFieldComponent;
  let fixture: ComponentFixture<FormlyUploadImageFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyUploadImageFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyUploadImageFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
