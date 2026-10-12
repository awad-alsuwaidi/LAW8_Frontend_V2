import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyAttachmentFieldComponent } from './formly-attachment-field.component';

describe('FormlyAttachmentFieldComponent', () => {
  let component: FormlyAttachmentFieldComponent;
  let fixture: ComponentFixture<FormlyAttachmentFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyAttachmentFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyAttachmentFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
