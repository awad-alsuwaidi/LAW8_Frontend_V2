import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyOtpFieldComponent } from './formly-otp-field.component';

describe('FormlyOtpFieldComponent', () => {
  let component: FormlyOtpFieldComponent;
  let fixture: ComponentFixture<FormlyOtpFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormlyOtpFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormlyOtpFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
