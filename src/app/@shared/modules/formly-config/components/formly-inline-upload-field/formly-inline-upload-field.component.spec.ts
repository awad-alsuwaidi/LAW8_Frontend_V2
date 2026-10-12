import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyInlineUploadFieldComponent } from './formly-inline-upload-field.component';

describe('FormlyInlineUploadFieldComponent', () => {
  let component: FormlyInlineUploadFieldComponent;
  let fixture: ComponentFixture<FormlyInlineUploadFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyInlineUploadFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyInlineUploadFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
