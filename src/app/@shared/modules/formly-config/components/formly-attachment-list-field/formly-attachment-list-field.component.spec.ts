import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyAttachmentListFieldComponent } from './formly-attachment-list-field.component';

describe('FormlyAttachmentListFieldComponent', () => {
  let component: FormlyAttachmentListFieldComponent;
  let fixture: ComponentFixture<FormlyAttachmentListFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyAttachmentListFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyAttachmentListFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
